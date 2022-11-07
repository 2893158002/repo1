package com.uyun.controller;

import com.github.pagehelper.PageInfo;
import com.uyun.domain.PromotionAd;
import com.uyun.domain.PromotionAdVO;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.PromotionAdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/PromotionAd")
public class PromotionAdController {
    @Autowired
    private PromotionAdService promotionAdService;

    @RequestMapping("/findAllPromotionAdByPage")
    public ResponseResult findAllAdByPage(PromotionAdVO promotionAdVO) {
        PageInfo<PromotionAd> ad = promotionAdService.findAllPromotionAdByPage(promotionAdVO);
        return new ResponseResult(true, 200, "广告分页查询成功", ad);
    }

    @RequestMapping("/PromotionAdUpload")
    public ResponseResult fileUpLoad(@RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException();
        }
        //项目部署路径
        //D:\apache-tomcat-8.5.56\webapps\ssm-web\
        String realPath = request.getServletContext().getRealPath("/");
        System.out.println(realPath);
        //D:\apache-tomcat-8.5.56\webapps\
        String substring = realPath.substring(0, realPath.indexOf("ssm_web"));
        //获取源文件名
        //lagou.jpg
        String originalFilename = file.getOriginalFilename();
        //生成新文件名
        //1121212.jpg
        String newFileName = System.currentTimeMillis() + originalFilename.substring(originalFilename.lastIndexOf("."));
        //文件上传
        String uploadPath = substring + "upload\\";
        File filepath = new File(uploadPath, newFileName);
        //如果目录不存在就创建目录
        if (!filepath.getParentFile().exists()) {
            filepath.getParentFile().mkdirs();
            System.out.println("创建目录：" + filepath);
        }

        //图片上传
        file.transferTo(filepath);
        //将文件名和文件路径返回，进行响应
        Map<String, String> objectMap = new HashMap<>();
        objectMap.put("fileNAme", newFileName);
        objectMap.put("filePath", "http://localhost:8080/upload" + newFileName);
        ResponseResult result = new ResponseResult(true, 200, "图片上传成功", objectMap);
        return result;
    }

    @RequestMapping("/updatePromotionAdStatus")
    public ResponseResult updatePromotionStatus(int id, int status) {
        promotionAdService.updatePromotionAdStatus(id, status);
        ResponseResult result = new ResponseResult(true, 200, "广告动态上下线成功", null);
        return result;
    }
}
