package www.service.implement;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import www.service.interfaces.MailService;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailServiceImpl implements MailService {
    
    private final JavaMailSender mailSender;

    @Override
    public void sendOtpMail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Xác thực tài khoản - OTP Code");
            message.setText(String.format(
                "Chào bạn,\n\n" +
                "Mã OTP để xác thực tài khoản của bạn là: %s\n\n" +
                "Mã này sẽ hết hạn sau 2 phút.\n\n" +
                "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ hỗ trợ",
                otp
            ));
            
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    @Override
    public void sendResetPasswordMail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Đặt lại mật khẩu - OTP Code");
            message.setText(String.format(
                "Chào bạn,\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n\n" +
                "Mã OTP để đặt lại mật khẩu của bạn là: %s\n\n" +
                "Mã này sẽ hết hạn sau 2 phút.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và liên hệ với chúng tôi ngay lập tức.\n\n" +
                "Vì lý do bảo mật, vui lòng không chia sẻ mã này với bất kỳ ai.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ hỗ trợ",
                otp
            ));
            
            mailSender.send(message);
            log.info("Reset password email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send reset password email to: {}", to, e);
            throw new RuntimeException("Failed to send reset password email", e);
        }
    }
}