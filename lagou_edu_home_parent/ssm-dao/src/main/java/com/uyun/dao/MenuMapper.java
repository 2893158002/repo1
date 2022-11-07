package com.uyun.dao;

import com.uyun.domain.Menu;

import java.util.List;

public interface MenuMapper {
    //查询所有父子菜单信息
    public List<Menu> findSubMenuListByPid(int pid);

    //查询角色信息
    public List<Menu> findAllMenu();

    public Menu findMenuById(int id);
}
