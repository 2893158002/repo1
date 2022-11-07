package com.uyun.servive.impl;

import com.uyun.dao.MenuMapper;
import com.uyun.domain.Menu;
import com.uyun.servive.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class MenuServiceImpl implements MenuService {
    @Autowired
    private MenuMapper menuService;
    @Override
    public List<Menu> findSubMenuListByPid(int pid) {
        List<Menu> byPid = menuService.findSubMenuListByPid(pid);

        return byPid;
    }

    @Override
    public List<Menu> findAllMenu() {
        List<Menu> allMenu = menuService.findAllMenu();
        return allMenu;
    }

    @Override
    public Menu findMenuById(Integer id) {
        Menu menu = menuService.findMenuById(id);
        return null;
    }
}
