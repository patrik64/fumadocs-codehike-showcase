import { type AnnotationHandler, InnerLine, InnerPre, InnerToken } from 'codehike/code';

// enabled with the `-w` flag in the code fence meta
export const wordWrap: AnnotationHandler = {
  name: 'word-wrap',
  Pre: (props) => <InnerPre merge={props} className="whitespace-pre-wrap" />,
  // A hanging indent as deep as the line's own indentation: the margin moves
  // the whole line right and the negative `text-indent` pulls its first row
  // back, so only the rows it wraps onto stay indented.
  Line: (props) => (
    <InnerLine merge={props}>
      <div
        style={{
          textIndent: `${-props.indentation}ch`,
          marginLeft: `${props.indentation}ch`,
        }}
      >
        {props.children}
      </div>
    </InnerLine>
  ),
  // `text-indent` is inherited, and a token that is an inline block (the
  // token-transitions handler makes them so) would apply it to itself
  Token: (props) => <InnerToken merge={props} style={{ textIndent: 0 }} />,
};
