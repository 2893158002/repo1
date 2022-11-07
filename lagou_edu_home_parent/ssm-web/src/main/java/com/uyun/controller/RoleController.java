package com.uyun.controller;

import com.uyun.domain.*;
import com.uyun.servive.MenuService;
import com.uyun.servive.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/role")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @RequestMapping("findAllRole")
    public ResponseResult findAllRole(@RequestBody Role role) {
        List<Role> role1 = roleService.findAllRole(role);
        ResponseResult result = new ResponseResult(true, 200, "查询所有角色成功", role1);
        return result;
    }

    @Autowired
    private MenuService menuService;

    @RequestMapping("/findAllMenu")
    public ResponseResult findSubMenuListByPid() {
        //表示查询所有父子级菜单
        List<Menu> byPid = menuService.findSubMenuListByPid(-1);
        //响应数据
        HashMap<String, Object> map = new HashMap<>();
        map.put("parentMenuList", byPid);
        ResponseResult result = new ResponseResult(true, 20, "查询所有父子级菜单成功", map);
        return result;
    }

    //查询角色id
    @RequestMapping("/findMenuByRoleId")
    public ResponseResult findMenuByRoleId(Integer roleId) {
        List<Integer> roleId1 = roleService.findMenuByRoleId(roleId);
        return new ResponseResult(true, 200, "查询成功", roleId1);

    }

    @RequestMapping("/RoleContextMenu")
    public ResponseResult RoleContextMenu(@RequestBody RoleMenuVo roleMenuVo) {
        roleService.roleContextMenu(roleMenuVo);
        ResponseResult result = new ResponseResult(true, 200, "响应成功", null);
        return result;
    }

    @RequestMapping("/deleteRole")
    public ResponseResult delete(Integer id) {
        roleService.deleteRole(id);
        ResponseResult result = new ResponseResult(true, 200, "删除成功", null);
        return result;
    }
}
