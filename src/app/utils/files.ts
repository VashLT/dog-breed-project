/**
 * Utility to download a file from a url, it creates a link element and
 * appends it to the body, then it clicks the link to download the file.
 * @param fileUrl url of the file
 * @param fileName name of the file
 */
export const downloadFile = async (fileUrl: string, fileName: string) => {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
