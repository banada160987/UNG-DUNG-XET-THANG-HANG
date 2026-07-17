import React from 'react';
import { X, BookOpen, FileText, CheckCircle, Shield, Star } from 'lucide-react';

export const UserGuideModal = ({ role, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-xl shrink-0">
          <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <BookOpen size={20} />
            HƯỚNG DẪN XÉT THĂNG HẠNG CHỨC DANH NGHỀ NGHIỆP
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded-full text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 text-slate-700 text-sm leading-relaxed">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-slate-800 uppercase">HƯỚNG DẪN QUY TRÌNH XÉT THĂNG HẠNG</h1>
            <p className="text-slate-500 italic">(Theo Kế hoạch số 125/KH-SGDĐT ngày 08/7/2026 của Sở Giáo dục và Đào tạo Đắk Lắk)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI: QUY ĐỊNH CHUNG */}
            <div className="space-y-6">
              <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2"><Shield size={18}/> I. Mục đích & II. Đối tượng</h3>
                <div className="space-y-3">
                  <p><strong>Mục đích:</strong> Lựa chọn viên chức đáp ứng đầy đủ tiêu chuẩn, điều kiện để được đề nghị thăng hạng chức danh nghề nghiệp theo đúng quy định của pháp luật và chỉ tiêu được giao.</p>
                  <p>Đảm bảo nguyên tắc: Công khai, Minh bạch, Khách quan, Đúng tiêu chuẩn, Đúng vị trí việc làm.</p>
                  <p><strong>Đối tượng:</strong> Viên chức đang công tác tại đơn vị gồm: Viên chức quản lý, Giáo viên, Nhân viên được đăng ký xét thăng hạng từ hạng thấp lên hạng cao hơn liền kề khi đáp ứng đầy đủ điều kiện.</p>
                </div>
              </section>

              <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2"><CheckCircle size={18}/> IV. Nguyên tắc & V. Thứ tự ưu tiên</h3>
                <div className="space-y-3">
                  <p><strong>Nguyên tắc:</strong> Nếu số lượng viên chức đủ điều kiện không vượt chỉ tiêu, tất cả viên chức đủ điều kiện được đề nghị. Nếu vượt chỉ tiêu, lựa chọn theo thứ tự ưu tiên.</p>
                  <p><strong>Thứ tự ưu tiên:</strong></p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Thành tích nghề nghiệp:</strong> Ưu tiên người có thành tích cao hơn đã được cấp có thẩm quyền công nhận (Huân chương, ..., Bằng khen, Chiến sĩ thi đua, Giấy khen).</li>
                    <li><strong>Nếu thành tích cùng cấp:</strong> Ưu tiên người có nhiều thành tích hơn. Thành tích cá nhân được ưu tiên trước thành tích tập thể.</li>
                    <li><strong>Nếu vẫn bằng nhau:</strong> Ưu tiên theo thứ tự: Viên chức là nữ &gt; Viên chức là người dân tộc thiểu số &gt; Người nhiều tuổi hơn &gt; Người có thời gian công tác nhiều hơn.</li>
                  </ol>
                </div>
              </section>
              
              <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2"><FileText size={18}/> VI. Kết quả rà soát</h3>
                <div className="space-y-3">
                  <p>Nhà trường lập 3 danh sách trình Hội đồng xét thăng hạng:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Danh sách 1:</strong> Viên chức đủ điều kiện xét thăng hạng.</li>
                    <li><strong>Danh sách 2:</strong> Viên chức chưa đủ điều kiện (ghi rõ nguyên nhân: Thiếu hồ sơ, Chưa đủ điều kiện giữ hạng...).</li>
                    <li><strong>Danh sách 3:</strong> Viên chức đủ điều kiện được sắp xếp theo đúng thứ tự ưu tiên.</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* CỘT PHẢI: QUY TRÌNH & TRÁCH NHIỆM */}
            <div className="space-y-6">
              <section className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2"><FileText size={18}/> III. Quy trình xét thăng hạng tại đơn vị</h3>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg bg-white shadow-sm border ${role === 'teacher' ? 'border-2 border-blue-500 relative' : 'border-slate-100'}`}>
                    {role === 'teacher' && <span className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Vai trò của bạn</span>}
                    <h4 className="font-bold text-slate-800">Bước 1. Giáo viên khai báo hồ sơ</h4>
                    <p className="mt-2 text-slate-600">Kê khai đầy đủ các thông tin: Thông tin cá nhân, Quá trình công tác, Văn bằng chứng chỉ, Thời gian giữ hạng, Thành tích...</p>
                    <div className="mt-2 text-sm bg-slate-50 p-2 rounded text-slate-700">
                      <strong>Trách nhiệm:</strong> Kê khai đầy đủ, trung thực. Chịu trách nhiệm về thông tin đã khai và bổ sung khi có yêu cầu.
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg bg-white shadow-sm border ${role === 'head' ? 'border-2 border-blue-500 relative' : 'border-slate-100'}`}>
                    {role === 'head' && <span className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Vai trò của bạn</span>}
                    <h4 className="font-bold text-slate-800">Bước 2. Tổ trưởng chuyên môn kiểm tra</h4>
                    <p className="mt-2 text-slate-600">Kiểm tra tính đầy đủ của thông tin, đối chiếu hồ sơ, yêu cầu bổ sung chỉnh sửa và xác nhận hồ sơ đủ điều kiện chuyển Tổ rà soát.</p>
                    <div className="mt-2 text-sm bg-slate-50 p-2 rounded text-slate-700">
                      <strong>Trách nhiệm:</strong> Kiểm tra thông tin, hướng dẫn bổ sung, xác nhận hồ sơ.
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg bg-white shadow-sm border ${(role === 'admin' || role === 'secretary') ? 'border-2 border-blue-500 relative' : 'border-slate-100'}`}>
                    {(role === 'admin' || role === 'secretary') && <span className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Vai trò của bạn</span>}
                    <h4 className="font-bold text-slate-800">Bước 3. Tổ rà soát của nhà trường</h4>
                    <p className="mt-2 text-slate-600">Kiểm tra điều kiện đăng ký, thành phần hồ sơ và xác định kết quả (Đủ / Chưa đủ điều kiện).</p>
                    <div className="mt-2 text-sm bg-slate-50 p-2 rounded text-slate-700">
                      <strong>Trách nhiệm:</strong> Kiểm tra điều kiện theo Kế hoạch 125, đối chiếu hồ sơ, sắp xếp ưu tiên và lập danh sách trình lãnh đạo.
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-emerald-50 p-5 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2"><Star size={18}/> Gợi ý áp dụng vào phần mềm</h3>
                <p className="mb-3">Quy trình số hóa bám sát Kế hoạch 125, mỗi hồ sơ sẽ đi qua các trạng thái:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-xs sm:text-sm">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Giáo viên đang kê khai</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Đã gửi Tổ trưởng</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Yêu cầu bổ sung</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Tổ trưởng xác nhận</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Tổ rà soát đang kiểm tra</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Chưa đủ điều kiện</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Đủ điều kiện</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Đã xếp thứ tự ưu tiên</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-slate-800"></span> Đã chốt danh sách đề nghị gửi Sở
                </div>
              </section>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
