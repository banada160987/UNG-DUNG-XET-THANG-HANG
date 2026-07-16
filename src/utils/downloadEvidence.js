import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { showAlert } from './alert';

// Utility helper to fetch a file as a Blob
const fetchFileBlob = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.blob();
  } catch (e) {
    console.error("Error fetching file:", url, e);
    return null;
  }
};

const getExtensionFromUrl = (url) => {
  try {
    // Basic extraction from path or token
    const parts = url.split('?')[0].split('.');
    if (parts.length > 1) {
      return '.' + parts.pop();
    }
  } catch (e) {
    return '';
  }
  return '';
};

export const downloadAllEvidenceAsZip = async (candidateData) => {
  if (!candidateData) return;

  showAlert('Thông báo', 'Hệ thống đang chuẩn bị nén các minh chứng. Quá trình này có thể mất vài phút tuỳ theo dung lượng mạng, vui lòng chờ...');

  const zip = new JSZip();
  const folder = zip.folder(`MinhChung_${candidateData.fullName || 'GiaoVien'}_${candidateData.cccd || 'Unknown'}`);
  
  const filesToDownload = [];

  // 1. Tuyển dụng
  if (candidateData.decisionRecruitment?.link) {
    filesToDownload.push({ name: `1_QuyetDinhTuyenDung${getExtensionFromUrl(candidateData.decisionRecruitment.link)}`, url: candidateData.decisionRecruitment.link });
  }
  if (candidateData.decisionProbation?.link) {
    filesToDownload.push({ name: `2_QuyetDinhHetTapSu${getExtensionFromUrl(candidateData.decisionProbation.link)}`, url: candidateData.decisionProbation.link });
  }
  if (candidateData.decisionAppointment?.link) {
    filesToDownload.push({ name: `3_QuyetDinhBoNhiemHang${getExtensionFromUrl(candidateData.decisionAppointment.link)}`, url: candidateData.decisionAppointment.link });
  }
  if (candidateData.decisionSalary?.link) {
    filesToDownload.push({ name: `4_QuyetDinhLuongGanNhat${getExtensionFromUrl(candidateData.decisionSalary.link)}`, url: candidateData.decisionSalary.link });
  }

  // 2. Văn bằng
  if (candidateData.degrees && Array.isArray(candidateData.degrees)) {
    candidateData.degrees.forEach((deg, idx) => {
      if (deg.link) {
        filesToDownload.push({ name: `VanBang_${idx + 1}_${deg.level}${getExtensionFromUrl(deg.link)}`, url: deg.link });
      }
    });
  }

  // 3. Thành tích
  if (candidateData.achievements && Array.isArray(candidateData.achievements)) {
    candidateData.achievements.forEach((ach, idx) => {
      if (ach.link) {
        filesToDownload.push({ name: `ThanhTich_${idx + 1}_${ach.id}${getExtensionFromUrl(ach.link)}`, url: ach.link });
      }
    });
  }
  if (candidateData.otherAchievements && Array.isArray(candidateData.otherAchievements)) {
    candidateData.otherAchievements.forEach((ach, idx) => {
      if (ach.link) {
        filesToDownload.push({ name: `ThanhTichKhac_${idx + 1}${getExtensionFromUrl(ach.link)}`, url: ach.link });
      }
    });
  }

  // 4. Các file khác
  if (candidateData.files && Array.isArray(candidateData.files)) {
    candidateData.files.forEach((f, idx) => {
      if (f.url || f.link) {
        const fileUrl = f.url || f.link;
        // Use original name if available, else fallback
        const ext = getExtensionFromUrl(fileUrl);
        const name = f.name ? f.name : `FileKhac_${idx + 1}${ext}`;
        filesToDownload.push({ name, url: fileUrl });
      }
    });
  }

  if (filesToDownload.length === 0) {
    showAlert('Thông báo', 'Không tìm thấy file minh chứng nào để tải về.');
    return;
  }

  // Fetch all files in parallel
  const fetchPromises = filesToDownload.map(async (fileObj) => {
    const blob = await fetchFileBlob(fileObj.url);
    if (blob) {
      folder.file(fileObj.name, blob);
    }
  });

  await Promise.all(fetchPromises);

  // Generate and save zip
  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `MinhChung_${candidateData.fullName || 'GiaoVien'}_${candidateData.cccd || 'Unknown'}.zip`);
    showAlert('Thành công', 'Đã tải xuống toàn bộ minh chứng thành công!');
  } catch (e) {
    console.error("Error generating zip", e);
    showAlert('Lỗi', 'Có lỗi xảy ra khi nén file. Vui lòng thử lại.');
  }
};
