package com.uyun.controller;

import com.github.pagehelper.PageInfo;
import com.uyun.domain.ResponseResult;
import com.uyun.domain.Role;
import com.uyun.domain.User;
import com.uyun.domain.UserVo;
import com.uyun.servive.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @RequestMapping("/findAllUserByPage")
    public ResponseResult findAllUserByPage(@RequestBody UserVo userVo) {
        PageInfo byPage = userService.findAllUserByPage(userVo);
        ResponseResult result = new ResponseResult(true, 200, "分页多条件查询成功", byPage);
        return result;
    }

    @RequestMapping("/login")
    public ResponseResult login(User user, HttpServletRequest request) throws Exception {
        User user1 = userService.login(user);
        System.out.println(" web层user1="+user1.getId());
        if (user1 != null) {
            //保存用户id以及access_token
            HttpSession session = request.getSession();
            String s = UUID.randomUUID().toString();
            session.setAttribute("access_token", s);
            session.setAttribute("user_id", user1.getId());

            Map<String, Object> map = new HashMap<>();
            map.put("access_token", s);
            map.put("user_id", user1.getId());
            return new ResponseResult(true, 1, "登录成功", map);
        }
        return new ResponseResult(true, 400, "登录失败", null);

    }

    @RequestMapping("/findUserRelationRoleById")
    public ResponseResult findUserRelationRoleById(Integer id) {
        List<Role> roleById = userService.findUserRelationRoleById(id);
        return new ResponseResult(true, 200, "分配角色回显成功", roleById);
    }

    //分配角色
    @RequestMapping("/userContextRole")
    public ResponseResult userContextRole(@RequestBody UserVo userVo) throws InvocationTargetException, IllegalAccessException {
        userService.userContextRole(userVo);
        ResponseResult result = new ResponseResult(true, 200, "分配角色成功", null);
        return result;
    }
//获取用户权限，进行菜单动态展示
    @RequestMapping("/getUserPermissions")
    public ResponseResult getUserPermissions(HttpServletRequest request){
        //获取请求头中的token
        String header_token = request.getHeader("Authorization");
        //获取session中token
        String access_token = (String) request.getSession().getAttribute("access_token");
        //判断token是否一致
        if(header_token.equals(access_token)){
            //获取用户id
            Integer userId = (Integer) request.getSession().getAttribute("user_id");
            //调用service进行菜单信息查询
            System.out.println("###### userId is " + userId);
            ResponseResult result = userService.getUserPermissions(userId);
            System.out.println("###### result is " + result);
            return result;
        }else {
            return new ResponseResult(false,400,"获取菜单信息失败",null);

        }
    }
}
