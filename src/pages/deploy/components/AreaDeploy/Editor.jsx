/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import E from 'wangeditor';
import { connect } from 'dva';

let editor = null;

function Editor(props) {
  const { dispatch, savedEditorContent, isShowEditor } = props;
  const editorRef = useRef();

  useEffect(() => {
    editor = new E(editorRef.current);
    // 使用 onchange 函数监听内容的变化，并实时更新
    editor.customConfig.onchange = html => {
      dispatch({ type: 'deploy/save', payload: { editorContent: html } });
    };
    editor.create();
  }, []);

  useEffect(() => {
    if (editor) editor.txt.html(savedEditorContent);
  }, [isShowEditor]);

  return (
    <>
      <div style={isShowEditor ? null : { display: 'none' }} ref={editorRef} />
      <div
        style={isShowEditor ? { display: 'none' } : null}
        dangerouslySetInnerHTML={{ __html: savedEditorContent }}
      ></div>
    </>
  );
}

export default connect(({ deploy: { savedEditorContent, isShowEditor } }) => ({
  savedEditorContent,
  isShowEditor,
}))(Editor);
