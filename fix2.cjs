const fs = require('fs');
const path = require('path');

const custom = {
  'Há»‡ thá»‘ng xÃ©t thÄƒng háº¡ng viÃªn chá»©c': 'Hệ thống xét thăng hạng viên chức',
  'TrÆ°á» ng THPT Cao BÃ¡ QuÃ¡t': 'Trường THPT Cao Bá Quát',
  'PhÆ°á» ng TÃ¢n An': 'Phường Tân An',
  'Tá»‰nh Ä áº¯k Láº¯k': 'Tỉnh Đắk Lắk',
  'Duyá»‡t há»“ sÆ¡ Tá»•': 'Duyệt hồ sơ Tổ',
  'HÆ°á»›ng dáº«n': 'Hướng dẫn',
  'Ä Ã¡nh Ä‘áº¥u': 'Đánh dấu',
  'Nháº­t kÃ½': 'Nhật ký',
  'Xuáº¥t thá»‘ng kÃª': 'Xuất thống kê',
  'Chi tiáº¿t thÃ nh tÃ­ch': 'Chi tiết thành tích',
  'PhÃ¢n tÃ­ch AI': 'Phân tích AI',
  'ThoÃ¡t': 'Thoát',
  'HÆ¡p lá»‡': 'Hợp lệ',
  'Tá»• trÆ°á»Ÿng xÃ¡c nháº­n': 'Tổ trưởng xác nhận',
  'nÃo': 'nào',
  'chá» n': 'chọn',
  'Chá»  xử lý': 'Chờ xử lý',
  'Ä ã duyệt': 'Đã duyệt',
  'Duyệt gộp': 'Duyệt gộp',
  'Há»‡ thá»‘ng': 'Hệ thống',
  'xÃ©t thÄƒng háº¡ng': 'xét thăng hạng',
  'viÃªn chá»©c': 'viên chức',
  'TrÆ°á» ng': 'Trường',
  'Cao BÃ¡ QuÃ¡t': 'Cao Bá Quát',
  'TÃ¢n An': 'Tân An',
  'Ä áº¯k Láº¯k': 'Đắk Lắk',
  'Tá»• trÆ°á»Ÿng': 'Tổ trưởng',
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
  'tá»• nÃ y': 'tổ này',
  'liÃªn há»‡': 'liên hệ',
  'Quáº£n trá»‹': 'Quản trị',
  'Báº£n quyá» n thuá»™c vá» ': 'Bản quyền thuộc về',
  'trÆ°á» ng': 'trường',
  'Xuáº¥t BÃ¡o CÃ¡o Sá»Ÿ': 'Xuất Báo Cáo Sở',
  'BÃ¡o CÃ¡o': 'Báo Cáo',
  'Sá»Ÿ': 'Sở',
  'Tá»• rÃ  soÃ¡t Ä‘ang kiá»ƒm tra': 'Tổ rà soát đang kiểm tra',
  'HÃ¡n': 'Hán',
  'Háº¡n chÃ³t ná»™p há»“ sÆ¡': 'Hạn chót nộp hồ sơ',
  'Ä‘áº¿n ngÃ y': 'đến ngày',
  'phÃºt ngÃ y': 'phút ngày',
  'GiÃ¡o viÃªn': 'Giáo viên',
  'Quáº£n trá»‹': 'Quản trị',
  'Sá»‘ CCCD cá»§a báº¡n': 'Số CCCD của bạn',
  'Nháº­p 12 sá»‘ CCCD...': 'Nhập 12 số CCCD...',
  'LÆ°u Ã½: Náº¿u chÆ°a cÃ³ tÃ i khoáº£n, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng táº¡o tÃ i khoáº£n báº±ng CCCD vÃ  Máº­t kháº©u báº¡n nháº­p á»Ÿ trÃªn.': 'Lưu ý: Nếu chưa có tài khoản, hệ thống sẽ tự động tạo tài khoản bằng CCCD và Mật khẩu bạn nhập ở trên.',
  'LÆ°u Ã½:': 'Lưu ý:',
  'Náº¿u chÆ°a cÃ³': 'Nếu chưa có',
  'sáº½ tá»±': 'sẽ tự',
  'báº¡n nháº­p á»Ÿ trÃªn.': 'bạn nhập ở trên.',
  'Ä Äƒng nháº­p': 'Đăng nhập',
  'thÃ nh tÃ­ch': 'thành tích',
  'Ä‘Ã£ xÃ³a': 'đã xóa'
};

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [k, v] of Object.entries(custom)) {
    content = content.split(k).join(v);
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