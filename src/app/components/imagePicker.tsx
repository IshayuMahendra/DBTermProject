import { faUpload, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

interface ImagePickerProps {
  onImage: (image: File | undefined) => void;
  onError: (error: string) => void;
  initialImageURL?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImage, onError, initialImageURL }) => {
  const [previewImgURL, setPreviewURL] = useState<string | undefined>(initialImageURL);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const handleImageChange = async () => {
    if(!fileUploadRef.current || !fileUploadRef.current.files || !fileUploadRef.current.files[0]) {
      onError("Error occured obtaining file upload");
      return;
    }

    const uploadedFile: File = fileUploadRef.current.files[0];

    if (!uploadedFile || !uploadedFile.type) {
      onError("Invalid file provided");
      return;
    }

    const uploadedFileType: string = uploadedFile.type.split("/")[0];
    if (uploadedFileType != "image") {
      onError("Invalid image type provided");
      return;
    }
    setPreviewURL(URL.createObjectURL(uploadedFile));
    onImage(uploadedFile);
  };

  return (
    <>
      <div className="pol-img-preview-box" onClick={() => {
        fileUploadRef.current?.click();
      }}>
        {previewImgURL && <img src={previewImgURL} alt="Preview of user uploaded image"></img>}
        <div className="selection-overlay">
        </div>
        <div className="selection-text" style={{ opacity: previewImgURL ? 0 : 1 }}>{previewImgURL ? <FontAwesomeIcon icon={faUpload} style={{ fontSize: "29px" }}></FontAwesomeIcon> : "Select An Image"}</div>
        <input
          type="file"
          id="polImageUpload"
          ref={fileUploadRef}
          onChange={handleImageChange}
          hidden />
      </div>
      <div className="flex">
        {previewImgURL && <button className="pol-button ml-auto mt-2" style={{ paddingTop: 10, paddingBottom: 10, fontSize: 12 }} onClick={() => {
          onImage(undefined);
          setPreviewURL(undefined);
          if(fileUploadRef.current) {
            fileUploadRef.current.value = "";
          }
        }}><FontAwesomeIcon icon={faX}></FontAwesomeIcon> Discard Image</button>}
      </div>
    </>
  )
}

export default ImagePicker;