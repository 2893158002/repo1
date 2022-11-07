package com.uyun.controller;

import com.uyun.domain.Menu;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuController {
    @Autowired
    private MenuService menuService;


    //查询角色信息
    @RequestMapping("/findAllMenu")
    public ResponseResult findAllMenu() {
        List<Menu> menu = menuService.findAllMenu();
        ResponseResult result = new ResponseResult(true, 200, "查询成功", menu);
        return result;
    }

    @RequestMapping("/findMenuInFoById")
    public ResponseResult findMenuInFoById(Integer id) {
//根据id的值判断当前是添加还是更新操作 判断id是否为-1
        if (id == -1) {
            List<Menu> subMenuListByPid = menuService.findSubMenuListByPid(-1);
            HashMap<String, Object> map = new HashMap<>();
            map.put("menuInfo", null);
            map.put("parentMenuList", subMenuListByPid);
            return new ResponseResult(true, 200, "添加回显成功", map);
        } else {
            Menu menu = menuService.findMenuById(id);
            List<Menu> subMenuListByPid = menuService.findSubMenuListByPid(-1);
            HashMap<String, Object> map = new HashMap<>();
            map.put("menuInfo", menu);
            map.put("parentMenuList", subMenuListByPid);
            return new ResponseResult(true, 200, "修改回显成功", map);
        }
    }
}
