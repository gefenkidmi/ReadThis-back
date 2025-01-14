import * as fs from "fs";

export async function saveImage(imagePath: string): Promise<string> {
  try {
    const filePath = `public/uploads/${Date.now()}.png`;

    await moveFile(imagePath, filePath);

    console.log(`Image saved at: ${filePath}`);
    return `/${filePath}`;
  } catch (err) {
    console.error("Error saving image:", err);
    throw new Error("Failed to save image.");
  }
}

async function moveFile(tempPath: string, targetPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
