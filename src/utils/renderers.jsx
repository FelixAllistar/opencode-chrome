import { Streamdown } from 'streamdown';

export const renderMessage = (text) => (
  <Streamdown
    components={{
      code({ node, inline, className, children, ...props }) {
        return inline ? (
          <code className={className} {...props}>
            {children}
          </code>
        ) : (
          <pre className={className} {...props}>
            <code>{children}</code>
          </pre>
        );
      },
    }}
  >
    {text}
  </Streamdown>
);