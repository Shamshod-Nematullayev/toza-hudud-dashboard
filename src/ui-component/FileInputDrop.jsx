import React, { useRef, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';

const CustomStyle = createGlobalStyle`
  .drop-zone {
    width: 100%;
    height: 100%;
    padding: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: "Quicksand", sans-serif;
    font-weight: 500;
    font-size: 20px;
    cursor: pointer;
    color: #cccccc;
    border: 4px dashed #009578;
    border-radius: 10px;
  }

  .drop-zone--over {
    border-style: solid;
  }

  .drop-zone__input {
    display: none;
  }

  .drop-zone__thumb {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
    background-color: #cccccc;
    background-size: cover;
    position: relative;
  }

  .drop-zone__thumb::after {
    content: attr(data-label);
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 5px 0;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.75);
    font-size: 14px;
    text-align: center;
  }
`;
function FileInputDrop({ setFunc }) {
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const dropZoneElement = dropZoneRef.current;
    const inputElement = fileInputRef.current;

    const handleDrop = async (e) => {
      e.preventDefault();
      dropZoneElement.classList.remove('drop-zone--over');

      if (e.dataTransfer.files.length) {
        inputElement.files = e.dataTransfer.files;
        updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        setFunc(inputElement.files);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      dropZoneElement.classList.add('drop-zone--over');
    };

    const handleDragLeave = () => {
      dropZoneElement.classList.remove('drop-zone--over');
    };

    const handleClick = () => {
      inputElement.click();
    };

    const handleChange = () => {
      if (inputElement.files.length) {
        updateThumbnail(dropZoneElement, inputElement.files[0]);
        console.log(inputElement.files);
      }
    };

    dropZoneElement.addEventListener('click', handleClick);
    dropZoneElement.addEventListener('dragover', handleDragOver);
    dropZoneElement.addEventListener('dragleave', handleDragLeave);
    dropZoneElement.addEventListener('dragend', handleDragLeave);
    dropZoneElement.addEventListener('drop', handleDrop);
    inputElement.addEventListener('change', handleChange);

    return () => {
      dropZoneElement.removeEventListener('click', handleClick);
      dropZoneElement.removeEventListener('dragover', handleDragOver);
      dropZoneElement.removeEventListener('dragleave', handleDragLeave);
      dropZoneElement.removeEventListener('dragend', handleDragLeave);
      dropZoneElement.removeEventListener('drop', handleDrop);
      inputElement.removeEventListener('change', handleChange);
    };
  }, []);

  const updateThumbnail = (dropZoneElement, file) => {
    let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

    if (dropZoneElement.querySelector('.drop-zone__prompt')) {
      dropZoneElement.querySelector('.drop-zone__prompt').remove();
    }

    if (!thumbnailElement) {
      thumbnailElement = document.createElement('div');
      thumbnailElement.classList.add('drop-zone__thumb');
      dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
      };
    } else {
      thumbnailElement.style.backgroundImage = null;
    }
  };
  return (
    <>
      <CustomStyle />
      <label className="drop-zone" ref={dropZoneRef} style={{ height: '100%', width: '100%' }}>
        <input
          type="file"
          name="myFile"
          className="drop-zone__input"
          disabled
          ref={fileInputRef}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        <div className="drop-zone__prompt">Drop your pdf files</div>
      </label>
    </>
  );
}

export default FileInputDrop;
