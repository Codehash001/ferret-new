import { env } from "@/lib/config";
import { supabase } from "@/lib/supabase-client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { LiaFileExportSolid } from "react-icons/lia";


interface Props {
  chatbotname: string;
  onFileSelectionChange: (selectedFiles: string[]) => void;
  onSelectedValueChange: (selectedValue: number | null) => void;
}

export const Sidebar: NextPage<Props> = ({
  chatbotname,
  onFileSelectionChange,
  onSelectedValueChange,
}) => {
  const [authors, setAuthors] = useState<any[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(4);


  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data: authorsData, error: authorsError } = await supabase
          .from("authors")
          .select("*")
          .eq("chatbot", chatbotname);

        if (authorsError) {
          throw authorsError;
        }

        setAuthors(authorsData);

        const filesPromises = authorsData.map(async (author) => {
          const { data: filesData, error: filesError } = await supabase
            .from("files_info")
            .select("*")
            .eq("author_name", author.author_name);

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
        console.error("Error fetching data:", error);
      }
    };

    const insertChannel = supabase.channel("files_info");

    insertChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "files_info" },
        fetchAuthors
      )
      .subscribe();

    fetchAuthors();
  }, [chatbotname]);

  const handleCheckboxChange = (fileName: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      const updatedSelectedFiles = prevSelectedFiles.includes(fileName)
        ? prevSelectedFiles.filter((selectedFile) => selectedFile !== fileName)
        : [...prevSelectedFiles, fileName];

      console.log(updatedSelectedFiles); // Log immediately when a checkbox is clicked
      onFileSelectionChange(updatedSelectedFiles);
      return updatedSelectedFiles;
    });
  };

  const handleRadioChange = (value: number) => {
    setSelectedValue(value);
    console.log(`Selected value: ${value}`);
    onSelectedValueChange(value);
  };

  function modifyFileName(fileName: string) {
    return fileName.replace(/_/g, " ").replace(".pdf", "");
  }

  const handleExportChat = async () => {
    // Get the chat content element
    const chatContent = document.getElementById("chatContent");
    if (chatContent) {
      try {
        const chatText = chatContent.innerText;
  
        // Get the current date and time
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/:/g, '-').split('.')[0];
  
        // Create a Blob containing the text
        const blob = new Blob([chatText], { type: 'text/plain' });
  
        // Create a link element and trigger a click to download the text file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `exported-document-${formattedDate}.txt`;
        link.click();
  
        // Release the Blob URL
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Error exporting chat:", error);
      }
    }
  };

  

  return (
    <div className="flex flex-col w-full h-full bg-background border-l rounded-xl shadow-lg">
      <div className="w-full p-4 bg-slate-200 dark:bg-[#070711] flex items-center justify-center rounded-tl-xl font-semibold text-xl">
        <img src="/Ferret.png" className="w-48"/>
      </div>
      <div className="w-full flex flex-col items-center justify-center py-2 px-2">
        <div className="flex flex-row items-end justify-between space-x-2">
          <h1 className="text-[12px] text-end uppercase">max speed</h1>
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <div className="flex flex-row pb-6"
            key={value}>
              <label
                className={`cursor-pointer h-5 w-5 flex flex-col items-center justify-center rounded-full ${
                  selectedValue === value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 dark:bg-gray-900"
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={selectedValue === value}
                  onChange={() => handleRadioChange(value)}
                  className="hidden"
                />
                <h1 className="text-sm">{value}</h1>
              </label>
            </div>
          ))}
          <h1 className="text-[12px] uppercase">max depth</h1>
        </div>
      </div>

      <div className="w-full h-full overflow-hidden flex flex-col items-center justify-start px-6 pb-4">
        <div className="w-full px-2 py-4 bg-pageBackground border flex items-center justify-center rounded-md font-semibold text-xl">
          Knowledge Base
        </div>
        <ul className="w-full flex flex-col justify-start space-y-6 mt-6 overflow-y-auto relative h-full pr-2">
          {authors.map((author, index) => (
            <li key={index} className="w-full">
              <div className="w-full p-2 border rounded-md font-medium bg-background flex flex-row items-center justify-start space-x-4">
                <img src={author.avatar_file_name?`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${author.avatar_file_name}` : '/default-avatar.png'} className="h-8 w-8 rounded-full border bg-white"/>
                <h1>{author.author_name}</h1>
              </div>
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
                        <div className="my-2 text-sm">
                          {modifyFileName(file.file.name)}
                        </div>
                      </label>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
        <button className="w-full flex flex-row items-center justify-center space-x-2 px-6 py-2 rounded-md  border-2 hover:bg-slate-200" onClick={handleExportChat}>
          <LiaFileExportSolid size={22}/>
          <span className="font-medium text-sm">Export Chat</span>
        </button>
      </div>
    </div>
  );
};
