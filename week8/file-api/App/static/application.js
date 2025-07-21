import Logger from "./logger.js";
import FileSystemApiWrapper from "./file-system-api.js";

const pickerOpts = {
  types: [
    {
      description: "Text",
      accept: {
        "text/plain": [".txt"],
      },
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false,
  startIn: "desktop",
};
const fileSystemApiWrapper = new FileSystemApiWrapper(pickerOpts);

const logger = new Logger("output");

fileSystemApiWrapper.addEventListener("log", (event) => {
  logger.log(event.detail);
});

fileSystemApiWrapper.addEventListener("error", (event) => {
  const error = event.detail.error;
  logger.log({ action: error.action, message: error.message });
});

document.getElementById("save-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApiWrapper.save(content);
};

document.getElementById("open-file").onclick = async () => {
  try {
    const file = await fileSystemApiWrapper.read();
    logger.log({
      action: "read",
      fileName: file.name,
      content: await file.text(),
    });
  } catch (error) {}
};

document.getElementById("update-file").onclick = async () => {
  const content = window.prompt("Enter content to save into file.");
  await fileSystemApiWrapper.update(content);
};

document.getElementById("delete-file").onclick = async () => {
  const fileName = window.prompt("Enter file name to delete");
  await fileSystemApiWrapper.delete(fileName);
};
