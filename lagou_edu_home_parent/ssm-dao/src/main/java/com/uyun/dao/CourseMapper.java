package com.uyun.dao;
import com.uyun.domain.CourseVO;
import com.uyun.domain.Course;
import com.uyun.domain.Teacher;

import java.util.List;
public interface CourseMapper {
    //多条件查询
    public List<Course> findCourseByCondition(CourseVO coursevo);
    //新增课程信息
    public void saveCourse(Course course);

    //新增老师
    public void saveTeacher(Teacher teacher);

    //根据id查询
    public CourseVO findCourseById(Integer id);

    //更新课程信息
    public void updateCourse(Course course);

    //更新讲师信息
    public void updateTeacher(Teacher teacher);

//更改课程状态
    public void updateCourseStatus(Course course);


}
