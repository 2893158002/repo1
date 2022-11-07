package com.uyun.servive;

import com.uyun.domain.Course;
import com.uyun.domain.CourseVO;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public interface CourseService {
    public List<Course> findCourseByCondition(CourseVO courseVo);

    //新增课程以及老师信息
    public void saveCourseOrTeacher(CourseVO courseVO) throws InvocationTargetException, IllegalAccessException;

    //根据id查询课程信息
    public CourseVO findCourseById(Integer id);

    //修改课程以及老师信息
    public void updateCourseOrTeacher(CourseVO courseVO) throws InvocationTargetException, IllegalAccessException;

    //课程状态变更
    public void updateCourseStatus(int courseid,int status);
}
