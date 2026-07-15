export const GAS_URL = "https://script.google.com/macros/s/AKfycby4j8dfQ8udO_zlXu3RiYZjnjoNieSTGl487Ob8Swd2GaZ-Y3iNa3VG7Ig9Cee35Qy4/exec";

export const uploadToDrive = async (file, prefix = "") => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      // Chuỗi Base64 trả về có dạng: "data:image/png;base64,iVBORw0KGgo..."
      // Cần tách lấy phần nội dung thực sự sau dấu phẩy
      const base64Data = reader.result.split(',')[1];
      
      // Tạo tên file an toàn: Tiền tố + Tên file gốc
      const safePrefix = prefix ? `${prefix}_`.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9 -]/g, '') : '';
      const finalFileName = `${safePrefix}${file.name}`;
      
      const payload = {
        name: finalFileName,
        mimeType: file.type,
        data: base64Data
      };
      
      try {
        const response = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (result.success) {
          resolve(result.link); // Trả về link Google Drive của file
        } else {
          reject(new Error(result.message || "Lỗi khi upload lên Drive"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
