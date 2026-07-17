import React from 'react';
import { X, BookOpen } from 'lucide-react';

export const UserGuideModal = ({ role, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <BookOpen size={20} />
            Hướng dẫn sử dụng hệ thống
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded-full text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          {role === 'teacher' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="text-blue-600 font-bold text-lg mb-3">Dành cho Giáo viên (Cá nhân đăng ký)</h3>
              <p className="mb-3">Hệ thống giúp thầy/cô số hóa toàn bộ hồ sơ đăng ký xét thăng hạng chức danh nghề nghiệp.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Khai báo thông tin:</strong> Điền đầy đủ thông tin cá nhân, quá trình công tác, văn bằng, chứng chỉ và các minh chứng kèm theo. Hãy chú ý các ô có dấu <code className="text-rose-500">*</code> màu đỏ là bắt buộc.</li>
                <li><strong>Thêm thành tích:</strong> Tại mục Thành tích, chọn loại thành tích và nhập đầy đủ số quyết định. Hệ thống tự động phát hiện nếu thông tin bị thiếu.</li>
                <li><strong>Lưu nháp:</strong> Nhấn <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Lưu nháp</span> nếu chưa hoàn thiện để tiếp tục điền sau.</li>
                <li><strong>Nộp hồ sơ:</strong> Khi đã chắc chắn, nhấn <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Nộp cho Tổ trưởng</span>. Sau khi nộp, thầy/cô không thể tự sửa hồ sơ trừ khi bị Tổ trưởng/Nhà trường trả lại.</li>
                <li><strong>Chỉnh sửa khi bị trả lại:</strong> Nếu hồ sơ bị báo <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-medium">Yêu cầu bổ sung</span>, hãy kiểm tra ghi chú báo lỗi, sửa lại thông tin và nộp lại.</li>
              </ul>
              <div className="mt-4 bg-rose-50 text-rose-700 p-3 rounded-md border-l-4 border-rose-500">
                <strong>Lưu ý:</strong> Vui lòng upload file minh chứng rõ nét. Các chứng chỉ phải đáp ứng đúng quy định của hạng chức danh đăng ký.
              </div>
            </div>
          )}

          {role === 'head' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="text-blue-600 font-bold text-lg mb-3">Dành cho Tổ trưởng Chuyên môn</h3>
              <p className="mb-3">Tổ trưởng có trách nhiệm kiểm tra tính hợp lệ ban đầu của hồ sơ các thành viên trong tổ.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Rà soát hồ sơ:</strong> Xem chi tiết từng hồ sơ trong tổ. Hệ thống đã đánh giá sơ bộ <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Hợp lệ</span> hoặc <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-medium">Chưa hợp lệ</span> để hỗ trợ tổ trưởng.</li>
                <li><strong>Nhắc nhở qua Zalo:</strong> Nhấn nút Zalo trên giao diện để copy nhanh tin nhắn báo thiếu hồ sơ và gửi trực tiếp cho giáo viên.</li>
                <li><strong>Yêu cầu bổ sung:</strong> Nếu phát hiện sai sót, chọn <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-medium">Yêu cầu bổ sung</span> và nhập lý do. Hồ sơ sẽ quay lại trạng thái cho phép giáo viên chỉnh sửa.</li>
                <li><strong>Duyệt hồ sơ:</strong> Với hồ sơ hoàn chỉnh, chọn <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Xác nhận đủ ĐK</span> để khóa hồ sơ.</li>
                <li><strong>Trình nhà trường:</strong> Khi tất cả hồ sơ trong tổ đã được xác nhận, nhấn <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-medium">Trình Hội đồng Trường</span> để chuyển dữ liệu lên cấp quản trị.</li>
              </ul>
            </div>
          )}

          {(role === 'admin' || role === 'secretary') && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="text-blue-600 font-bold text-lg mb-3">Dành cho Hội đồng / Quản trị viên (Admin) / Thư ký</h3>
              <p className="mb-3">Giao diện điều hành tổng thể, cho phép kiểm duyệt cuối cùng, so sánh và xếp hạng.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Quản lý toàn trường:</strong> Theo dõi tiến độ nộp hồ sơ của toàn bộ các tổ. Dùng bộ lọc để tìm nhanh hồ sơ theo môn, trạng thái.</li>
                <li><strong>Duyệt hồ sơ lần cuối:</strong> Đánh giá trạng thái <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Đủ điều kiện</span> hoặc <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-medium">Không đủ điều kiện</span> để đưa vào vòng xét ưu tiên.</li>
                <li><strong>So sánh chéo:</strong> Chọn nhiều hồ sơ (tick vào ô vuông) và nhấn <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">So sánh</span> để đối chiếu song song thành tích, năm sinh, quá trình công tác của nhiều ứng viên cùng lúc.</li>
                {role === 'admin' && (
                  <li><strong>Thiết lập Chỉ tiêu & Xếp hạng:</strong> 
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>Nhấn <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Chỉ tiêu</span> để đặt số lượng trúng tuyển cho từng hạng (VD: Hạng II cần 2 người).</li>
                      <li>Nhấn <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Xếp hạng Ưu tiên</span> để hệ thống tự động chạy thuật toán xếp hạng toàn trường dựa trên thành tích.</li>
                    </ul>
                  </li>
                )}
                {role === 'admin' && (
                  <li><strong>Chốt danh sách & Xuất file:</strong> Nhấn <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-medium">Trình Hiệu trưởng</span> để khóa toàn bộ kết quả, sau đó tải danh sách Excel và xuất trực tiếp <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Tờ trình (Word)</span> chuẩn format.</li>
                )}
              </ul>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mt-6">
            <h3 className="text-green-800 font-bold text-lg mb-3">⚙️ Cơ chế Vận hành Đánh giá & Xếp hạng Tự động</h3>
            <p className="mb-4">Hệ thống hoạt động dựa trên các nguyên tắc minh bạch, tự động quét và phân loại:</p>
            
            <h4 className="text-green-700 font-semibold mb-1">A. Cơ chế Rà soát Điều kiện (Eligibility)</h4>
            <p className="mb-4 text-slate-600">Mỗi khi lưu hoặc nộp, hệ thống kiểm tra ngay lập tức các ràng buộc: CCCD, file đính kèm Sơ yếu lý lịch, Nhận xét, đủ các Quyết định tuyển dụng/nâng lương, Văn bằng, Chứng chỉ, và các ô Nhập thành tích không được bỏ trống. Nếu thiếu, hồ sơ bị hiển thị <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-medium text-xs">Thiếu thông tin</span>.</p>
            
            <h4 className="text-green-700 font-semibold mb-1">B. Thuật toán Xếp hạng Ưu tiên (Ranking)</h4>
            <p className="mb-2 text-slate-600">Hệ thống áp dụng luật so sánh đa tầng theo thứ tự ưu tiên gắt gao:</p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li><strong>Cấp độ Thành tích (Quan trọng nhất):</strong> So sánh dựa trên thành tích cao nhất. (VD: "Chiến sĩ thi đua cấp Tỉnh" tự động xếp trên "Giáo viên dạy giỏi cấp Tỉnh").</li>
              <li><strong>Số lượng Thành tích Cao nhất:</strong> Nếu trùng cấp độ thành tích, hệ thống đếm xem ai có <em>nhiều</em> thành tích ở cấp độ đó hơn.</li>
              <li><strong>Danh hiệu Cá nhân vs Tập thể:</strong> Nếu vẫn hòa, ưu tiên người có thành tích thuộc diện "Cá nhân".</li>
              <li><strong>Giới tính Nữ:</strong> Nếu thành tích ngang bằng hoàn toàn, ưu tiên Nữ theo quy định.</li>
              <li><strong>Người lớn tuổi hơn:</strong> So sánh năm sinh, ai lớn tuổi hơn được xếp trên.</li>
              <li><strong>Thâm niên công tác:</strong> So sánh năm được tuyển dụng/bổ nhiệm lần đầu, ai vào ngành trước được ưu tiên.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
