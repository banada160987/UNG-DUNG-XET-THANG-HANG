const fs = require('fs');
const path = require('path');

const dict = {
  'Ã¡': 'á', 'Ã ': 'à', 'áº£': 'ả', 'Ã£': 'ã', 'áº¡': 'ạ',
  'Ã¢': 'â', 'áº¥': 'ấ', 'áº§': 'ầ', 'áº©': 'ẩ', 'áº«': 'ẫ', 'áº­': 'ậ',
  'Äƒ': 'ă', 'áº¯': 'ắ', 'áº±': 'ằ', 'áº³': 'ẳ', 'áºµ': 'ẵ', 'áº·': 'ặ',
  'Ã©': 'é', 'Ã¨': 'è', 'áº»': 'ẻ', 'áº½': 'ẽ', 'áº¹': 'ẹ',
  'Ãª': 'ê', 'áº¿': 'ế', 'á» ': 'ề', 'á»ƒ': 'ể', 'á»…': 'ễ', 'á»‡': 'ệ',
  'Ã­': 'í', 'Ã¬': 'ì', 'á»‰': 'ỉ', 'Ä©': 'ĩ', 'á»‹': 'ị',
  'Ã³': 'ó', 'Ã²': 'ò', 'á» ': 'ỏ', 'Ãµ': 'õ', 'á» ': 'ọ',
  'Ã´': 'ô', 'á»‘': 'ố', 'á»“': 'ồ', 'á»•': 'ổ', 'á»—': 'ỗ', 'á»™': 'ộ',
  'Æ¡': 'ơ', 'á»›': 'ớ', 'á» ': 'ờ', 'á»Ÿ': 'ở', 'á»¡': 'ỡ', 'á»£': 'ợ',
  'Ãº': 'ú', 'Ã¹': 'ù', 'á»§': 'ủ', 'Å©': 'ũ', 'á»¥': 'ụ',
  'Æ°': 'ư', 'á»©': 'ứ', 'á»«': 'ừ', 'á»­': 'ử', 'á»¯': 'ữ', 'á»±': 'ự',
  'Ã½': 'ý', 'á»³': 'ỳ', 'á»·': 'ỷ', 'á»¹': 'ỹ', 'á»µ': 'ỵ',
  'Ä‘': 'đ', 'Ä ': 'Đ',
  'Ã ': 'Á', 'Ã€': 'À', 'áº¢': 'Ả', 'Ãƒ': 'Ã', 'áº ': 'Ạ',
  'Ã‚': 'Â', 'áº¤': 'Ấ', 'áº¦': 'Ầ', 'áº¨': 'Ẩ', 'áºª': 'Ẫ', 'áº¬': 'Ậ',
  'Ä‚': 'Ă', 'áº®': 'Ắ', 'áº°': 'Ằ', 'áº²': 'Ẳ', 'áº´': 'Ẵ', 'áº¶': 'Ặ',
  'Ã‰': 'É', 'Ãˆ': 'È', 'áºº': 'Ẻ', 'ÃŠ': 'Ê', 'áº¸': 'Ẹ',
  'ÃŠ': 'Ê', 'áº¾': 'Ế', 'á»€': 'Ề', 'á»‚': 'Ể', 'á»„': 'Ễ', 'á»†': 'Ệ',
  'Ã ': 'Í', 'ÃŒ': 'Ì', 'á»ˆ': 'Ỉ', 'Ä¨': 'Ĩ', 'á»Š': 'Ị',
  'Ã“': 'Ó', 'Ã’': 'Ò', 'á»Ž': 'Ỏ', 'Ã•': 'Õ', 'á»Œ': 'Ọ',
  'Ã”': 'Ô', 'á» ': 'Ố', 'á»’': 'Ồ', 'á»”': 'Ổ', 'á»–': 'Ỗ', 'á»˜': 'Ộ',
  'Æ ': 'Ơ', 'á»š': 'Ớ', 'á»œ': 'Ờ', 'á»ž': 'Ở', 'á» ': 'Ỡ', 'á»¢': 'Ợ',
  'Ãš': 'Ú', 'Ã™': 'Ù', 'á»¦': 'Ủ', 'Å¨': 'Ũ', 'á»¤': 'Ụ',
  'Æ¯': 'Ư', 'á»¨': 'Ứ', 'á»ª': 'Ừ', 'á»¬': 'Ử', 'á»®': 'Ữ', 'á»°': 'Ự',
  'Ã ': 'Ý', 'á»²': 'Ỳ', 'á»¶': 'Ỷ', 'á»¸': 'Ỹ', 'á»´': 'Ỵ'
};

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Custom manual replacements for common words that might contain corrupted chars like U+FFFD
  const custom = {
    'Há»‡ thá»‘ng': 'Hệ thống',
    'xÃ©t thÄƒng háº¡ng': 'xét thăng hạng',
    'viÃªn chá»©c': 'viên chức',
    'THPT Cao BÃ¡ QuÃ¡t': 'THPT Cao Bá Quát',
    'PhÆ°á» ng TÃ¢n An': 'Phường Tân An',
    'Tá»‰nh Ä áº¯k Láº¯k': 'Tỉnh Đắk Lắk',
    'ThÆ° kÃ½': 'Thư ký',
    'TÃªn Ä‘Äƒng nháºp': 'Tên đăng nhập',
    'Ä‘Äƒng nháºp': 'đăng nhập',
    'Máºt kháº©u': 'Mật khẩu',
    'tÃi khoáº£n': 'tài khoản',
    'Ä‘á»™ng táº¡o': 'động tạo',
    'báº±ng': 'bằng',
    'ThÃ´ng bÃ¡o': 'Thông báo',
    'Vui lÃ²ng': 'Vui lòng',
    'nháºp': 'nhập',
    'Ä‘Ãºng': 'đúng',
    'Lá»—i': 'Lỗi',
    'káº¿t ná»‘i': 'kết nối',
    'CÆ¡ sá»Ÿ dá»¯ liá»‡u': 'Cơ sở dữ liệu',
    'cÆ¡ sá»Ÿ dá»¯ liá»‡u': 'cơ sở dữ liệu',
    'Ä Ã¢y lÃ': 'Đây là',
    'láº§n Ä‘Äƒng nháºp Ä‘áº§u tiÃªn': 'lần đăng nhập đầu tiên',
    'Ä‘á»ƒ': 'để',
    'tÃ i khoáº£n': 'tài khoản',
    'Ä‘Ã£': 'đã',
    'bá»‹ khoÃ¡ táº¡m thá» i': 'bị khoá tạm thời',
    'sai quÃ¡ nhiá» u láº§n': 'sai quá nhiều lần',
    'thá»- láº¡i sau': 'thử lại sau',
    'phÃºt': 'phút',
    'ChÆ°a cÃ³': 'Chưa có',
    'Tá»• trÆ°á»Ÿng': 'Tổ trưởng',
    'tá»• nÃ y': 'tổ này',
    'liÃªn há»‡': 'liên hệ',
    'Quáº£n trá»‹': 'Quản trị',
    'Báº£n quyá» n thuá»™c vá» ': 'Bản quyền thuộc về',
    'trÆ°á» ng': 'trường',
    'Duyá»‡t há»“ sÆ¡ Tá»•': 'Duyệt hồ sơ Tổ',
    'HÆ°á»›ng dáº«n': 'Hướng dẫn',
    'Ä Ã¡nh Ä‘áº¥u': 'Đánh dấu',
    'Nháº­t kÃ½': 'Nhật ký',
    'Xuáº¥t thá»‘ng kÃª': 'Xuất thống kê',
    'bÃ¡o cÃ¡o': 'báo cáo',
    'Chi tiáº¿t thÃ nh tÃ­ch': 'Chi tiết thành tích',
    'PhÃ¢n tÃ­ch AI': 'Phân tích AI',
    'ThoÃ¡t': 'Thoát',
    'HÆ¡p lá»‡': 'Hợp lệ',
    'Tá»• trÆ°á»Ÿng xÃ¡c nháº­n': 'Tổ trưởng xác nhận',
    'Ä Ã£ xÃ³a': 'Đã xóa',
    'TÃ¬m kiáº¿m': 'Tìm kiếm',
    'TÃ¬m': 'Tìm'
  };

  for (const [k, v] of Object.entries(custom)) {
    content = content.split(k).join(v);
  }

  // Then general dict
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    content = content.split(k).join(dict[k]);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.html') || p.endsWith('.json')) {
      fixMojibake(p);
    }
  }
}

walk('.');