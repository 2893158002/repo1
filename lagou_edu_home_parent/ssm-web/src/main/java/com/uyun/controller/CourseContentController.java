package com.uyun.controller;

import com.uyun.dao.CourseContentMapper;
import com.uyun.domain.Course;
import com.uyun.domain.CourseSection;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.CourseContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courseContent")
public class CourseContentController {
    @Autowired
    private CourseContentService courseContentService;

    @RequestMapping("/findSectionAndLesson")
    public ResponseResult findSectionAndLessonByCourseId(Integer courseId) {
        List<CourseSection> lesson = courseContentService.findCourseAndLessonByCourseId(courseId);
        ResponseResult result = new ResponseResult(true, 200, "成功", lesson);
        return result;
    }

    @RequestMapping("/findCourseByCourseId")
    public ResponseResult findCourseByCourseId(Integer courseId) {
        Course byCourseId = courseContentService.findCourseByCourseId(courseId);
        ResponseResult result = new ResponseResult(true, 200, "响应成功", byCourseId);
        return result;
    }

    @RequestMapping("/saveOrUpdateSection")
    public ResponseResult saveOrUpdateCourseSection(@RequestBody CourseSection courseSection) {
        if (courseSection.getId() == null) {
            courseContentService.saveCurseSection(courseSection);
            ResponseResult result = new ResponseResult(true, 200, "添加课程成功", null);
            return result;
        } else {
            courseContentService.updateCourseSection(courseSection);
            ResponseResult result = new ResponseResult(true, 200, "修改课程成功", null);
            return result;
        }
    }
    @RequestMapping("/updateCourseStatus")
    public ResponseResult updateCourseStatus(int id,int status){
        courseContentService.updateSectionStatus(id,status);
        Map<String, Object> objectObjectHashMap = new HashMap<>();
        objectObjectHashMap.put("status",status);
        ResponseResult result = new ResponseResult(true, 200, "更改状态成功", objectObjectHashMap);
        return result;
    }
}
