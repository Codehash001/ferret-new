import { supabase } from "@/lib/supabase-client";
import { NextPage } from "next";
import { useEffect, useState } from "react";

interface Props {
  chatbotname: string;
  onFileSelectionChange: (selectedFiles: string[]) => void;
}

export const Sidebar: NextPage<Props> = ({ chatbotname , onFileSelectionChange }) => {
  const [authors, setAuthors] = useState<any[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data: authorsData, error: authorsError } = await supabase
          .from('authors')
          .select('*')
          .eq('chatbot', chatbotname);

        if (authorsError) {
          throw authorsError;
        }

        setAuthors(authorsData);

        const filesPromises = authorsData.map(async (author) => {
          const { data: filesData, error: filesError } = await supabase
            .from('files_info')
            .select('*')
            .eq('author_name', author.author_name);

          if (filesError) {
            throw filesError;
          }

          return { authorName: author.author_name, files: filesData };
        });

        const filesResults = await Promise.all(filesPromises);
        const flattenedFiles = filesResults.flatMap((result) =>
          result.files.map((file) => ({ authorName: result.authorName, file }))
        );

        setFiles(flattenedFiles);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const insertChannel = supabase.channel('files_info');

    insertChannel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'files_info' },
        fetchAuthors,
      )
      .subscribe();

    fetchAuthors();
  }, []);

  const handleCheckboxChange = (fileName: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      const updatedSelectedFiles = prevSelectedFiles.includes(fileName)
        ? prevSelectedFiles.filter((selectedFile) => selectedFile !== fileName)
        : [...prevSelectedFiles, fileName];

      console.log(updatedSelectedFiles); // Log immediately when a checkbox is clicked
      onFileSelectionChange(updatedSelectedFiles);
      return updatedSelectedFiles;
    });
  }

  function modifyFileName(fileName : string) {
    return fileName.replace(/_/g, ' ').replace('.pdf', '');
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col items-center justify-start p-4">
      <div className="w-full px-2 py-6 bg-[#dee4e7] dark:bg-[#070711] border flex items-center justify-center rounded-md font-semibold text-xl">knowledge base</div>
      <ul className="w-full h-full flex flex-col justify-start space-y-6 mt-6">
        {authors.map((author, index) => (
          <li key={index} className="w-full">
            <div className="w-full p-2 border rounded-md font-medium bg-background/50">{author.author_name}</div>
            <ul className="w-full pl-3 mt-2">
              {files
                .filter((file) => file.authorName === author.author_name)
                .map((file, fileIndex) => (
<li key={fileIndex} className="flex flex-row space-x-3">
  <label className="flex flex-row space-x-2 max-h-12 items-center">
    <input
      type="checkbox"
      value={file.file.name}
      checked={selectedFiles.includes(file.file.name)}
      onChange={() => handleCheckboxChange(file.file.name)}
      className="custom-checkbox"
    />
    <div className="my-2">{modifyFileName(file.file.name)}</div>
  </label>
</li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};