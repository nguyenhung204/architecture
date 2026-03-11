# Bài 10: PHP với Apache
# Sử dụng php:8.2-apache làm base image
FROM php:8.2-apache

# Kích hoạt mod_rewrite của Apache (hữu ích cho các framework PHP)
RUN a2enmod rewrite

# Thiết lập thư mục gốc của Apache
WORKDIR /var/www/html

# Copy mã nguồn PHP vào container
# Khi develop, có thể dùng volume mount thay thế:
#   docker run -v $(pwd)/src:/var/www/html -p 8080:80 php-apache-app
COPY src/ /var/www/html/

# Cấp quyền đọc-ghi cho thư mục web
RUN chown -R www-data:www-data /var/www/html

# Expose cổng 80
EXPOSE 80

# Apache chạy ở foreground (mặc định của base image)
CMD ["apache2-foreground"]
