-- 初始化数据库
CREATE DATABASE IF NOT EXISTS excavator;
USE excavator;

-- 字典类型表 (RuoYi)
CREATE TABLE IF NOT EXISTS sys_dict_type (
  dict_id          BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '字典主键',
  dict_name        VARCHAR(100)    DEFAULT ''                 COMMENT '字典名称',
  dict_type        VARCHAR(100)    DEFAULT ''                 COMMENT '字典类型',
  status           CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  create_by        VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time      DATETIME        DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by        VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time      DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  remark           VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (dict_id),
  UNIQUE (dict_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典类型表';

-- 字典数据表 (RuoYi)
CREATE TABLE IF NOT EXISTS sys_dict_data (
  dict_code        BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '字典编码',
  dict_sort        INT(4)          DEFAULT 0                  COMMENT '字典排序',
  dict_label       VARCHAR(100)    DEFAULT ''                 COMMENT '字典标签',
  dict_value       VARCHAR(100)    DEFAULT ''                 COMMENT '字典键值',
  dict_type        VARCHAR(100)    DEFAULT ''                 COMMENT '字典类型',
  css_class        VARCHAR(100)    DEFAULT NULL               COMMENT '样式属性（其他样式扩展）',
  list_class       VARCHAR(100)    DEFAULT NULL               COMMENT '表格回显样式',
  is_default       CHAR(1)         DEFAULT 'N'                COMMENT '是否默认（Y是 N否）',
  status           CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  create_by        VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time      DATETIME        DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by        VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time      DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  remark           VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (dict_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典数据表';

-- 插入初始字典数据

-- 1. 机械类型 (machine_type)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('机械类型', 'machine_type', '0', 'admin', '挖掘机大小分类');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '微挖', '1', 'machine_type', '0', 'admin'),
(2, '小挖', '2', 'machine_type', '0', 'admin'),
(3, '中挖', '3', 'machine_type', '0', 'admin'),
(4, '大挖', '4', 'machine_type', '0', 'admin');

-- 2. 工作时长单位 (work_hours_unit)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('工作时长单位', 'work_hours_unit', '0', 'admin', '计费单位或工时单位');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '小时', '1', 'work_hours_unit', '0', 'admin'),
(2, '天', '2', 'work_hours_unit', '0', 'admin'),
(3, '周', '3', 'work_hours_unit', '0', 'admin'),
(4, '月', '4', 'work_hours_unit', '0', 'admin'),
(5, '年', '5', 'work_hours_unit', '0', 'admin');

-- 3. 机械状态 (machine_status)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('机械状态', 'machine_status', '0', 'admin', '设备当前状态');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '下架', '0', 'machine_status', '0', 'admin'),
(2, '空闲', '1', 'machine_status', '0', 'admin'),
(3, '工作中', '2', 'machine_status', '0', 'admin');

-- 4. 需求类型 (demand_type)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('需求类型', 'demand_type', '0', 'admin', '发布需求的类型');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '求租设备', '1', 'demand_type', '0', 'admin'),
(2, '招聘机手', '2', 'demand_type', '0', 'admin');

-- 5. 需求状态 (demand_status)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('需求状态', 'demand_status', '0', 'admin', '需求单状态');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '已关闭', '0', 'demand_status', '0', 'admin'),
(2, '进行中', '1', 'demand_status', '0', 'admin'),
(3, '已完成', '2', 'demand_status', '0', 'admin');

-- 6. 合同状态 (contract_status)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('合同状态', 'contract_status', '0', 'admin', '合同签署状态');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '草稿', '0', 'contract_status', '0', 'admin'),
(2, '待签署', '1', 'contract_status', '0', 'admin'),
(3, '已生效', '2', 'contract_status', '0', 'admin'),
(4, '已过期', '3', 'contract_status', '0', 'admin'),
(5, '已终止', '4', 'contract_status', '0', 'admin');

-- 7. 财务类型 (finance_type)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('财务类型', 'finance_type', '0', 'admin', '收入或支出');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '收入', '1', 'finance_type', '0', 'admin'),
(2, '支出', '2', 'finance_type', '0', 'admin');

-- 8. 财务分类 (finance_category)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('财务分类', 'finance_category', '0', 'admin', '收支具体分类');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '租金', '1', 'finance_category', '0', 'admin'),
(2, '油费', '2', 'finance_category', '0', 'admin'),
(3, '维修', '3', 'finance_category', '0', 'admin'),
(4, '工资', '4', 'finance_category', '0', 'admin'),
(5, '其他', '5', 'finance_category', '0', 'admin');

-- 9. 用户角色 (user_role)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('用户角色', 'user_role', '0', 'admin', '用户身份类型');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '机主', '1', 'user_role', '0', 'admin'),
(2, '施工方', '2', 'user_role', '0', 'admin'),
(3, '机手', '3', 'user_role', '0', 'admin');

-- 10. 实名状态 (user_auth_status)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('实名状态', 'user_auth_status', '0', 'admin', '实名认证审核状态');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '未认证', '0', 'user_auth_status', '0', 'admin'),
(2, '审核中', '1', 'user_auth_status', '0', 'admin'),
(3, '已通过', '2', 'user_auth_status', '0', 'admin'),
(4, '已拒绝', '3', 'user_auth_status', '0', 'admin');

-- 11. 系统是否 (sys_yes_no)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('系统是否', 'sys_yes_no', '0', 'admin', '是否标识');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '是', 'Y', 'sys_yes_no', '0', 'admin'),
(2, '否', 'N', 'sys_yes_no', '0', 'admin');

-- 12. 系统状态 (sys_normal_disable)
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, remark) VALUES 
('系统状态', 'sys_normal_disable', '0', 'admin', '通用状态');
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by) VALUES 
(1, '正常', '0', 'sys_normal_disable', '0', 'admin'),
(2, '停用', '1', 'sys_normal_disable', '0', 'admin');

-- 用户表
CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    wx_openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
    union_id VARCHAR(64) COMMENT '微信UnionID',
    phone VARCHAR(20) NOT NULL COMMENT '手机号(加密存储)',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    gender TINYINT(1) DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女 (dict: sys_user_sex)',
    role VARCHAR(64) NOT NULL DEFAULT '1' COMMENT '角色 (dict: user_role)',
    real_name VARCHAR(50) COMMENT '真实姓名(加密)',
    id_card VARCHAR(32) COMMENT '身份证号(加密)',
    real_name_status VARCHAR(64) DEFAULT '0' COMMENT '实名状态 (dict: user_auth_status)',
    company_name VARCHAR(100) COMMENT '公司名称',
    credit_code VARCHAR(32) COMMENT '统一社会信用代码',
    status CHAR(1) DEFAULT '0' COMMENT '状态 (dict: sys_normal_disable)',
    last_login_at DATETIME COMMENT '最后登录时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 机械设备表
CREATE TABLE IF NOT EXISTS t_machine (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '所属机主ID',
    type VARCHAR(64) NOT NULL COMMENT '设备类型 (dict: machine_type)',
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    model VARCHAR(50) NOT NULL COMMENT '型号',
    year YEAR NOT NULL COMMENT '购买年份',
    work_hours VARCHAR(64) NOT NULL COMMENT '工作时长 (dict: work_hours_unit)',
    rent_amount DECIMAL(10,2) NOT NULL COMMENT '租金金额',
    rent_unit VARCHAR(64) NOT NULL COMMENT '租金单位 (dict: work_hours_unit)',
    province VARCHAR(50) NOT NULL COMMENT '省份',
    city VARCHAR(50) NOT NULL COMMENT '城市',
    district VARCHAR(50) NOT NULL COMMENT '区县',
    address VARCHAR(200) NOT NULL COMMENT '详细地址',
    latitude DECIMAL(10,7) COMMENT '纬度',
    longitude DECIMAL(10,7) COMMENT '经度',
    description TEXT COMMENT '设备描述',
    images JSON NOT NULL COMMENT '设备图片JSON数组',
    status VARCHAR(64) DEFAULT '1' COMMENT '状态 (dict: machine_status)',
    is_top CHAR(1) DEFAULT 'N' COMMENT '是否置顶 (dict: sys_yes_no)',
    top_expire_at DATETIME COMMENT '置顶过期时间',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    contact_count INT DEFAULT 0 COMMENT '联系次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机械设备信息表';

-- 需求表 (原 orders)
CREATE TABLE IF NOT EXISTS t_demand (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '发布者ID',
    type VARCHAR(64) NOT NULL COMMENT '需求类型 (dict: demand_type)',
    machine_types JSON NOT NULL COMMENT '所需机型JSON数组',
    province VARCHAR(50) NOT NULL COMMENT '省份',
    city VARCHAR(50) NOT NULL COMMENT '城市',
    district VARCHAR(50) NOT NULL COMMENT '区县',
    address VARCHAR(200) NOT NULL COMMENT '详细施工地址',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    budget_min DECIMAL(10,2) COMMENT '预算下限',
    budget_max DECIMAL(10,2) COMMENT '预算上限',
    description TEXT NOT NULL COMMENT '需求描述',
    is_urgent CHAR(1) DEFAULT 'N' COMMENT '是否急聘 (dict: sys_yes_no)',
    status VARCHAR(64) DEFAULT '1' COMMENT '状态 (dict: demand_status)',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    contact_count INT DEFAULT 0 COMMENT '联系次数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求信息表';

-- 合同表
CREATE TABLE IF NOT EXISTS t_contract (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    contract_no VARCHAR(32) NOT NULL UNIQUE COMMENT '合同编号',
    machine_id BIGINT COMMENT '关联设备ID',
    demand_id BIGINT COMMENT '关联需求ID',
    lessor_id BIGINT NOT NULL COMMENT '出租方ID',
    lessee_id BIGINT NOT NULL COMMENT '承租方ID',
    template_id BIGINT NOT NULL COMMENT '合同模板ID',
    content_hash VARCHAR(64) NOT NULL COMMENT '合同内容哈希值',
    pdf_url VARCHAR(255) COMMENT '合同PDF文件URL',
    lessor_sign_status CHAR(1) DEFAULT '0' COMMENT '出租方签署状态 (dict: sys_yes_no)',
    lessee_sign_status CHAR(1) DEFAULT '0' COMMENT '承租方签署状态 (dict: sys_yes_no)',
    sign_expire_at DATETIME COMMENT '签署截止时间',
    status VARCHAR(64) DEFAULT '0' COMMENT '合同状态 (dict: contract_status)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (lessor_id) REFERENCES t_user(id),
    FOREIGN KEY (lessee_id) REFERENCES t_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子合同表';

-- 财务记账表 (原 records)
CREATE TABLE IF NOT EXISTS t_finance_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    contract_id BIGINT COMMENT '关联合同ID',
    machine_id BIGINT COMMENT '关联设备ID',
    type VARCHAR(64) NOT NULL COMMENT '收支类型 (dict: finance_type)',
    category VARCHAR(64) NOT NULL COMMENT '分类 (dict: finance_category)',
    amount DECIMAL(10,2) NOT NULL COMMENT '金额',
    record_date DATE NOT NULL COMMENT '记账日期',
    remark VARCHAR(200) COMMENT '备注说明',
    voucher_images JSON COMMENT '凭证图片JSON数组',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务记账记录表';
