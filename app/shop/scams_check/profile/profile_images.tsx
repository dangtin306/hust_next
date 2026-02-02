import React, { useState } from "react";
import Modal from "react-modal";
import type { Styles } from "react-modal";
const Profile_images = ({ profile_info }: { profile_info: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to open the modal
  const openModal = (image: any) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Custom styles for Modal
  // Custom styles for Modal
  const modalStyle: Styles = {
    content: {
      // top: '50%',
      left: "0%",
      right: "auto",
      bottom: "auto",
      position: "relative",
      margin: "auto",
      background: "none",
      border: "none",
      padding: "0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      maxWidth: "97%", // Ensures the modal content doesn't exceed screen width
      maxHeight: "90%", // Ensures the modal content doesn't exceed screen height
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center", // Center the content both vertically and horizontally
    },
  };
  return (
    <>
      {/* Evidence Section */}
      <div className="p-1 bg-pink-50">
        <div className="flex text-center flex-nowrap justify-start overflow-x-auto px-1 gap-0">
          {(Array.isArray(profile_info?.images_data) ? profile_info.images_data : []).map((image: any) => (
            // <div key={image.id} className="p-1 flex-shrink-0">
            <div key={image.id} className="p-1 shrink-0">
              <img
                src={`https://hust.media/api/scams_check/data/images/${image.img}`}
                alt={`Evidence ${image.id}`}
                className="w-48 h-auto rounded-lg border-2 border-pink-300 shadow-md cursor-pointer"
                onClick={() => openModal(image.img)} // Open modal when image is clicked
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal Section */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal} // Close modal on ESC or overlay click
        contentLabel="Image Modal"
        style={modalStyle} // Apply custom styles here
        shouldCloseOnOverlayClick={true} // Close when clicking on overlay
        ariaHideApp={false} // Optional, for development
      >
        {/* Overlay close button, positioned relative to the overlay, not the image */}
        <div className="fixed top-16 right-3 z-50">
          <button
            className="px-3 py-2 text-lg bg-white rounded-full text-black shadow-lg"
            onClick={closeModal}
          >
            ✕
          </button>
        </div>

        {/* Image content centered */}
        <div className="relative">
          {selectedImage && (
            <img
              src={`https://hust.media/api/scams_check/data/images/${selectedImage}`}
              alt="Enlarged Evidence"
              className="max-w-full max-h-screen rounded-lg"
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default Profile_images;
