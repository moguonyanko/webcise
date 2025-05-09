(function (win, doc, m) {
  "use strict";

  const area = m.ref("UploadResultArea"),
      progress = m.ref("UploadProgress"),
      targetInput = m.ref("UploadTargetFile");

  function getXHR() {
    var xhr = new XMLHttpRequest();
    return xhr;
  }

  function getTargetFile() {
    return targetInput.files[0];
  }

  function eventLog(evt) {
    m.log(evt);
  }

  function reportError(evt) {
    alert(evt);
  }

  const getMaxValue = () => parseInt(progress.getAttribute("max"));

  function setProgress(value) {
    const max = getMaxValue();
    if (max <= value) {
      progress.setAttribute("value", max);
      progress.innerHTML += max + "% upload!";
    } else {
      progress.setAttribute("value", value);
      progress.innerHTML += value + "% upload now...";
    }
  }

  const finishProgress = () => {
    const max = progress.getAttribute("max");
    progress.setAttribute('value', getMaxValue());
  };

  const resetProgress = () => progress.setAttribute('value', 0);

  function reportProgress(evt) {
    if (evt.lengthComputable) {
      var total = evt.total,
          loaded = evt.loaded;

      var value = (loaded / total) * 100;
      setProgress(value);
    }
  }

  function upload() {
    return new Promise((resolve, reject) => {
      var xhr = getXHR();
      xhr.open("POST", "https://myhost/webcise/Upload");
      /**
       * Content-Typeは自動的に「multipart/form-data」になりboundaryも
       * 自動的に生成される。自分で設定すると正しい「multipart/form-data」の
       * リクエストボディになっていないとしてサーバ側でエラーになる。
       */
      //var boundary = "; boundary=---------------------------sampleboundary2015";
      //xhr.setRequestHeader("Content-Type", "multipart/form-data" + boundary);

      /* サーバ側でエラーが起きてもloadstartとloadendは発生する。 */
      xhr.upload.onloadstart = eventLog;
      xhr.upload.onloadend = eventLog;
      xhr.upload.onprogress = reportProgress;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            resolve(res);
          } else if (xhr.status >= 400) {
            reject(xhr.status);
          }
        }
      };
      xhr.upload.onload = eventLog;
      xhr.upload.ontimeout = eventLog;
      xhr.upload.onabort = reject;
      xhr.upload.onerror = reject;

      var formData = new FormData();
      var file = getTargetFile();
      formData.append("samplefile", file);
      xhr.send(formData);
    });
  }

  const reset = () => {
    resetProgress();
    m.println(area, "", true);
  };

  (function () {
    m.addListener(m.ref("UploadRunner"), "click", async () => {
      try {
        const res = await upload();
        // この時点でonprogressの処理が完了していないことがある。
        finishProgress();
        m.println(area, res.message, true);
      } catch (err) {
        console.log(err);
        reportError(err);
      }
    }, false);
    m.addListener(m.ref("ClearProgress"), "click", reset, false);
    targetInput.addEventListener('change', reset);
  }());
}(window, document, my));
