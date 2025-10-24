import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export const renderMessage = (text) => (
  <Markdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
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
  </Markdown>
);