// // parent.tsx

// import { useState } from 'react';
// import { Sidebar } from './sidebar';
// import { Chat } from './chat';

// const ParentComponent: React.FC = () => {
//   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

//   const handleCheckboxChange = (fileName: string) => {
//     setSelectedFiles((prevSelectedFiles) => {
//       const updatedSelectedFiles = prevSelectedFiles.includes(fileName)
//         ? prevSelectedFiles.filter((selectedFile) => selectedFile !== fileName)
//         : [...prevSelectedFiles, fileName];

//       return updatedSelectedFiles;
//     });
//   };

//   return (
//     <>
//       <Sidebar chatbotname={namespace} selectedFiles={selectedFiles} handleCheckboxChange={handleCheckboxChange} />
//       <Chat namespace={namespace} selectedFiles={selectedFiles} />
//     </>
//   );
// };

// export default ParentComponent;
