import Tesseract from 'tesseract.js';

export const performOCR = async (file, onProgress) => {
  try {
    const result = await Tesseract.recognize(
      file,
      'vie', // Vietnamese language
      { 
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        } 
      }
    );
    return parseCCCD(result.data.text);
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};

const parseCCCD = (text) => {
  const data = {};
  
  // Tìm chuỗi 12 số liên tiếp (Số CCCD)
  const cccdMatch = text.match(/\d{12}/);
  if (cccdMatch) {
    data.cccd = cccdMatch[0];
  }
  
  // Tìm ngày sinh (định dạng DD/MM/YYYY)
  const dobMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
  if (dobMatch) {
    data.dob = dobMatch[0];
  }

  // Cố gắng tìm Họ Tên (Thường là chữ In Hoa toàn bộ sau dòng chữ "Họ và tên / Full name")
  // Do OCR có thể nhận diện sai một số ký tự, nên ta dùng regex tương đối
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('HỌ VÀ TÊN') || line.includes('FULL NAME') || line.includes('HO VA TEN')) {
      // Họ tên thường nằm ở dòng ngay sau hoặc cùng dòng nhưng tách biệt
      let nameLine = line.replace(/.*(HỌ VÀ TÊN|FULL NAME|HO VA TEN):?/, '').trim();
      if (!nameLine && i + 1 < lines.length) {
        nameLine = lines[i+1].trim();
      }
      
      // Lọc bỏ các ký tự đặc biệt, giữ lại chữ cái và khoảng trắng
      nameLine = nameLine.replace(/[^A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]/g, '').trim();
      
      if (nameLine.length > 3) {
        data.fullName = nameLine;
      }
      break;
    }
  }

  return data;
};
