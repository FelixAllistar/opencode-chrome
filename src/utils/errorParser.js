/**
 * Centralized error parsing utility for handling different types of errors
 * from AI SDK, fetch, network calls, and other sources.
 */

export const ERROR_CATEGORIES = {
  AUTH: 'auth',
  NETWORK: 'network',
  MODEL: 'model',
  STREAMING: 'streaming',
  HTTP: 'http',
  TIMEOUT: 'timeout',
  GENERIC: 'generic'
};

/**
 * Parses an error object and returns structured error information
 * @param {Error} error - The error object to parse
 * @returns {Object} Structured error information with category, message, and details
 */
export function parseError(error) {
  console.log('🔍 Parsing error:', error);

  // Handle null/undefined errors
  if (!error) {
    return {
      category: ERROR_CATEGORIES.GENERIC,
      message: 'An unknown error occurred.',
      details: null,
      shouldRetry: false
    };
  }

  // Check for AI SDK specific errors
  const aiSdkError = parseAiSdkError(error);
  if (aiSdkError) {
    return aiSdkError;
  }

  // Check for HTTP/fetch errors
  const httpError = parseHttpError(error);
  if (httpError) {
    return httpError;
  }

  // Check for network errors
  const networkError = parseNetworkError(error);
  if (networkError) {
    return networkError;
  }

  // Check for timeout errors
  const timeoutError = parseTimeoutError(error);
  if (timeoutError) {
    return timeoutError;
  }

  // Fallback to generic error handling
  return parseGenericError(error);
}

/**
 * Parses AI SDK specific errors
 */
function parseAiSdkError(error) {
  const message = error.message || '';
  const cause = error.cause;

  // AI_NoOutputGeneratedError - Check for underlying cause first
  if (error.name === 'AI_NoOutputGeneratedError' || message.includes('No output generated')) {
    // Check if there's an underlying cause that's more specific
    if (cause) {
      const causeError = parseError(cause);
      if (causeError.category !== ERROR_CATEGORIES.GENERIC) {
        // If the cause is a specific error type (auth, model, network), return that instead
        console.log('🔍 Found underlying cause for NoOutputGeneratedError:', causeError);
        return causeError;
      }
    }

    // Check the full error stack/message for 401 or model errors
    const fullErrorText = (error.stack || '') + ' ' + message;

    if (fullErrorText.includes('401') || fullErrorText.includes('Unauthorized')) {
      return {
        category: ERROR_CATEGORIES.AUTH,
        message: 'Authentication failed. Your API key is invalid or missing.',
        details: 'Please check your API key in settings and ensure it\'s correct and active.',
        shouldRetry: false
      };
    }

    if (fullErrorText.includes('Model') && fullErrorText.includes('not supported')) {
      const modelName = extractModelName(fullErrorText);
      return {
        category: ERROR_CATEGORIES.MODEL,
        message: `The model "${modelName || 'selected model'}" is not available or not supported.`,
        details: 'Please try a different model from the model selection dropdown.',
        shouldRetry: false
      };
    }

    return {
      category: ERROR_CATEGORIES.STREAMING,
      message: 'The AI model did not generate any output. This can happen when the response is empty or filtered.',
      details: 'Try rephrasing your prompt or check if your request violates content policies.',
      shouldRetry: true
    };
  }

  // AI_APICallError - Model not supported
  if (error.name === 'AI_APICallError' || message.includes('not supported')) {
    const modelName = extractModelName(message);
    return {
      category: ERROR_CATEGORIES.MODEL,
      message: `The model "${modelName || 'selected model'}" is not available or not supported.`,
      details: 'Please try a different model from the model selection dropdown.',
      shouldRetry: false
    };
  }

  // AI_APICallError - General API errors
  if (error.name === 'AI_APICallError') {
    return {
      category: ERROR_CATEGORIES.HTTP,
      message: 'AI API call failed.',
      details: message || 'The API returned an error. Check your request and try again.',
      shouldRetry: true
    };
  }

  // Check for wrapped errors in cause chain
  if (cause) {
    const causeError = parseError(cause);
    if (causeError.category !== ERROR_CATEGORIES.GENERIC) {
      return causeError;
    }
  }

  return null;
}

/**
 * Parses HTTP and fetch errors
 */
function parseHttpError(error) {
  const message = error.message || '';

  // Check for status codes in error or cause
  const status = error.status || error.cause?.status;
  const statusText = error.statusText || error.cause?.statusText;

  if (status === 401 || message.includes('401') || message.includes('Unauthorized')) {
    return {
      category: ERROR_CATEGORIES.AUTH,
      message: 'Authentication failed. Your API key is invalid or missing.',
      details: 'Please check your API key in settings and ensure it\'s correct and active.',
      shouldRetry: false
    };
  }

  if (status === 403 || message.includes('403') || message.includes('Forbidden')) {
    return {
      category: ERROR_CATEGORIES.AUTH,
      message: 'Access forbidden. Your API key doesn\'t have permission for this operation.',
      details: 'Please check your API key permissions and account settings.',
      shouldRetry: false
    };
  }

  if (status === 429 || message.includes('429') || message.includes('rate limit')) {
    return {
      category: ERROR_CATEGORIES.HTTP,
      message: 'Rate limit exceeded. Too many requests were made.',
      details: 'Please wait a moment and try again.',
      shouldRetry: true,
      retryDelay: 5000
    };
  }

  if (status === 500 || status === 502 || status === 503 || status === 504) {
    const serverErrorNames = {
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return {
      category: ERROR_CATEGORIES.HTTP,
      message: `Server error: ${serverErrorNames[status] || 'HTTP ' + status}`,
      details: 'The AI service is experiencing issues. Please try again in a few minutes.',
      shouldRetry: true,
      retryDelay: 10000
    };
  }

  // Generic HTTP errors
  if (status || message.includes('HTTP') || message.includes('fetch')) {
    return {
      category: ERROR_CATEGORIES.HTTP,
      message: `HTTP Error${status ? ` (${status})` : ''}`,
      details: statusText || message || 'A network request failed.',
      shouldRetry: true
    };
  }

  return null;
}

/**
 * Parses network-related errors
 */
function parseNetworkError(error) {
  const message = error.message || '';
  const name = error.name || '';

  // Chrome network errors
  if (message.includes('ERR_NETWORK_CHANGED') ||
      message.includes('ERR_INTERNET_DISCONNECTED') ||
      message.includes('ERR_CONNECTION_RESET') ||
      message.includes('ERR_CONNECTION_REFUSED')) {
    return {
      category: ERROR_CATEGORIES.NETWORK,
      message: 'Network connection failed.',
      details: 'Your internet connection was lost or changed. Please check your connection and try again.',
      shouldRetry: true
    };
  }

  // CORS errors
  if (message.includes('CORS') || message.includes('Cross-Origin')) {
    return {
      category: ERROR_CATEGORIES.NETWORK,
      message: 'Network access blocked by CORS policy.',
      details: 'The browser blocked the request due to CORS restrictions. This is usually a server configuration issue.',
      shouldRetry: false
    };
  }

  // Generic TypeError (often indicates network issues)
  if (name === 'TypeError' && message.includes('fetch')) {
    return {
      category: ERROR_CATEGORIES.NETWORK,
      message: 'Network request failed.',
      details: 'Unable to connect to the AI service. Check your internet connection.',
      shouldRetry: true
    };
  }

  // Generic network-related errors
  if (message.includes('network') ||
      message.includes('connection') ||
      message.includes('fetch failed') ||
      name === 'NetworkError') {
    return {
      category: ERROR_CATEGORIES.NETWORK,
      message: 'Network error occurred.',
      details: message || 'A network error prevented the request from completing.',
      shouldRetry: true
    };
  }

  return null;
}

/**
 * Parses timeout errors
 */
function parseTimeoutError(error) {
  const message = error.message || '';
  const name = error.name || '';

  if (name === 'TimeoutError' ||
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('AbortError')) {
    return {
      category: ERROR_CATEGORIES.TIMEOUT,
      message: 'Request timed out.',
      details: 'The request took too long to complete. The AI service might be overloaded or your connection might be slow.',
      shouldRetry: true
    };
  }

  return null;
}

/**
 * Parses generic errors as fallback
 */
function parseGenericError(error) {
  const message = error.message || 'Unknown error occurred';
  const name = error.name || '';

  return {
    category: ERROR_CATEGORIES.GENERIC,
    message: 'An error occurred while processing your request.',
    details: `${name}: ${message}`,
    shouldRetry: true
  };
}

/**
 * Extracts model name from error message
 */
function extractModelName(message) {
  const modelMatch = message.match(/(?:model|error-)([a-zA-Z0-9_-]+)/i);
  return modelMatch ? modelMatch[1] : null;
}

/**
 * Formats error for UI display
 * @param {Object} parsedError - Error object from parseError()
 * @returns {Object} Formatted error for Tool component
 */
export function formatErrorForUI(parsedError) {
  return {
    toolName: 'Error',
    args: {},
    result: null,
    error: parsedError.message,
    errorDetails: parsedError.details,
    errorCategory: parsedError.category,
    shouldRetry: parsedError.shouldRetry,
    retryDelay: parsedError.retryDelay || 0
  };
}