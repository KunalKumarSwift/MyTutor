FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql && a2enmod rewrite

RUN printf '<Directory /var/www/html>\n    AllowOverride All\n</Directory>\n' \
    >> /etc/apache2/apache2.conf
