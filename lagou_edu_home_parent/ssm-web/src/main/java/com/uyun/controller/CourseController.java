package com.uyun.controller;

import com.uyun.domain.Course;
import com.uyun.domain.CourseVO;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.CourseService;
import org.slf4j.ILoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.security.PublicKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/course")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @RequestMapping("/findCourseByCondition")
    public ResponseResult findCourseByCondition(@RequestBody CourseVO courseVo) {
        List<Course> courseByCondition = courseService.findCourseByCondition(courseVo);
        ResponseResult res = new ResponseResult(true, 200, "响应成功", courseByCondition);
        return res;
    }

    @RequestMapping("/courseUpload")
    public ResponseResult fileUpLoad(@RequestParam("file")MultipartFile file, HttpServletRequest request) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException();
        }
        //项目部署路径
        //D:\apache-tomcat-8.5.56\webapps\ssm-web\
        String realPath = request.getServletContext().getRealPath("/");
        System.out.println(realPath);
        //D:\apache-tomcat-8.5.56\webapps\
        String substring = realPath.substring(0,realPath.indexOf("ssm_web"));
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
@RequestMapping("/findCourseById")
public ResponseResult findCourseById(Integer id){
    CourseVO courseById = courseService.findCourseById(id);
    ResponseResult result = new ResponseResult(true, 200, "根据id查询课程信息成功", courseById);
return result;
    }

@RequestMapping("/saveOrUpdateCourse")
    public ResponseResult saveOrUpdateCourse(@RequestBody CourseVO courseVO) throws InvocationTargetException, IllegalAccessException {
        if(courseVO.getId()==null){
            courseService.saveCourseOrTeacher(courseVO);
            ResponseResult result = new ResponseResult(true, 200, "新增成功", null);
            return result;
        }else {
            courseService.updateCourseOrTeacher(courseVO);
            ResponseResult result = new ResponseResult(true, 200, "修改成功", null);
            return result;
        }
    }

    //课程状态管理
    @RequestMapping("/updateCourseStatus")
    public ResponseResult updateCourseStatus(Integer id,Integer status){
        //调用service传递参数完成课程状态的变更
        courseService.updateCourseStatus(id,status);

        //响应数据
        HashMap<String, Object> objectObjectHashMap = new HashMap<>();
        objectObjectHashMap.put("status",status);
        ResponseResult result = new ResponseResult(true, 200, "课程状态变更成功", objectObjectHashMap);
        return result;
    }
}
