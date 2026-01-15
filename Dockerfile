FROM nginx:alpine

# 将构建产物复制到nginx的html目录
COPY dist /usr/share/nginx/html

# 复制自定义的nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 80

# 启动nginx服务器
CMD ["nginx", "-g", "daemon off;"]