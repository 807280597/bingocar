// 网站配置
const websiteConfig = {
    // 网站基本信息
    siteInfo: {
        title: "优选汽车 - 高品质二手车交易平台",
        description: "提供优质二手车买卖、评估、金融服务的专业平台",
        logo: "images/logo.png",
        contactPhone: "400-888-8888",
        address: "北京市朝阳区建国路88号",
        copyright: "© 2023 优选汽车 版权所有"
    },
    
    // 首页配置
    homePage: {
        // 轮播图配置
        carousel: [
            {
                id: 1,
                image: "images/banner1.jpg",
                title: "精选好车，品质保障",
                link: "#"
            },
            {
                id: 2,
                image: "images/banner2.jpg",
                title: "0首付购车，轻松开回家",
                link: "#"
            },
            {
                id: 3,
                image: "images/banner3.jpg",
                title: "专业检测，安心购车",
                link: "#"
            }
        ],
        
        // 服务特点
        features: [
            {
                icon: "icon-certificate",
                title: "品质认证",
                description: "259项专业检测"
            },
            {
                icon: "icon-refresh",
                title: "7天无理由退车",
                description: "不满意随时退"
            },
            {
                icon: "icon-shield",
                title: "1年2万公里质保",
                description: "故障免费修"
            },
            {
                icon: "icon-file-text",
                title: "手续齐全",
                description: "资质真实可靠"
            }
        ],
        
        // 热门车型分类
        categories: [
            {
                id: 1,
                name: "SUV",
                icon: "icon-suv",
                link: "#category-suv"
            },
            {
                id: 2,
                name: "轿车",
                icon: "icon-sedan",
                link: "#category-sedan"
            },
            {
                id: 3,
                name: "新能源",
                icon: "icon-energy",
                link: "#category-new-energy"
            },
            {
                id: 4,
                name: "豪华车",
                icon: "icon-luxury",
                link: "#category-luxury"
            },
            {
                id: 5,
                name: "性价比",
                icon: "icon-value",
                link: "#category-value"
            }
        ]
    },
    
    // 详情页配置
    detailPage: {
        // 推荐车型标题
        recommendTitle: "猜你喜欢",
        
        // 车辆参数展示配置
        parameterGroups: [
            {
                groupName: "基本信息",
                params: ["车型", "上牌时间", "表显里程", "排量", "变速箱", "排放标准"]
            },
            {
                groupName: "车辆配置",
                params: ["座椅材质", "天窗", "导航", "倒车影像", "驾驶辅助", "智能互联"]
            },
            {
                groupName: "检测信息",
                params: ["外观检测", "内饰检测", "发动机检测", "底盘检测", "电气系统"]
            }
        ],
        
        // 购车服务
        services: [
            {
                icon: "icon-finance",
                title: "金融服务",
                description: "低首付、低月供"
            },
            {
                icon: "icon-insurance",
                title: "保险服务",
                description: "多家保险公司合作"
            },
            {
                icon: "icon-license",
                title: "过户服务",
                description: "专人办理，省心省力"
            }
        ]
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { websiteConfig };
}