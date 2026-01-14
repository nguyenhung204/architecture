package www.service.interfaces;

public interface MailService {
    void sendOtpMail(String to, String otp);
    void sendResetPasswordMail(String to, String otp);
}