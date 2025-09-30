--- 环境准备
--- 1. 父类测试需要自己接一个TestParent.lua，路径可以根据自己需要切换            PropertyLevelTest
--- 2. 一个Actor蓝图绑定到这个脚本上，并且内置一个BpLevelProperty变量           PropertyLevelTest
--- 3. Cpp的全局函数                                                         TArrayTest

local TestChild = UnLua.Class("Utils.Test.TestParent")

TestChild.ModuleLevelProperty   = "ModuleLevelProperty"
TestChild.ModuleModifyProperty  = 0

local SmallStrike   = "------------------------------"
local BigStrike     = "========================================"

function TestChild:Initialize()
    print(BigStrike.." Initialize "..BigStrike)

    --[[
        Lua Global 全局表由下面几个部分组成（在调试侧栏常见项）
        1) 原生全局函数与成员：
           pcall, xpcall, require, error, assert, warn,
           collectgarbage,
           loadfile, dofile, load,
           tostring, tonumber, type, next, pairs, ipairs, select,
           rawequal, rawget, rawset, 
           setmetatable, getmetatable,
           print                           -- 注意：被UnLua重定向
           _VERSION
           _G
           https://atom-l.github.io/lua5.4-manual-zh/6.1.html

        2) 标准库（全局表）：
           math, string, table, coroutine, os, io, debug, package, utf8
           https://atom-l.github.io/lua5.4-manual-zh/6.html

        3) UE/引擎注入的全局（UnLua 环境中常见）：
           UE                               -- Unreal Engine API 封装（蓝图/类访问）
           UE4                              -- 兼容旧命名或引擎导出
           SetUProperty, GetUProperty       -- UnLuaLib
           UEPrint                          -- print 重定向前的原生函数
           LoadClass, LoadObject, NewObject -- UELib，UE表创建时顺带创建的全局函数，UnLua::UELib::Open
           Class

        4) UnLua/项目注入的工具与模块：
           UnLua                            -- UnLua 提供的全局表（如 UnLua.Log 等工具函数）

        5) 其它按项目注册的全局模块
           例如LuaPanda等
    ]]
    -- 测试print重定向
    print("[UnLuaTest Global] Modified print "  , print, UnLua.Log, UEPrint)

    --[[
        全局表：UE 表（用途与常见用法）

        里面存放了
            UE_Lib.cpp 里注册的函数
                __index = UE_Index              -- 查询导出，会将结果写回UE表，加速下次查询
                static constexpr luaL_Reg UE_Functions[] = {
                    {"LoadObject", UObject_Load},
                    {"LoadClass", UClass_Load},
                    {"NewObject", Global_NewObject},
                    {NULL, NULL}
                };

            自动导出 UCLASS 蓝图类
            手动导出 由Binding.cpp FExported控制 导出宏在 UnLuaEx.h
                例如手动导出ESlateVisiblity
                BEGIN_EXPORT_ENUM(ESlateVisibility)
                    ADD_SCOPED_ENUM_VALUE(Visible)
                    ADD_SCOPED_ENUM_VALUE(Collapsed)
                    ADD_SCOPED_ENUM_VALUE(Hidden)
                    ADD_SCOPED_ENUM_VALUE(HitTestInvisible)
                    ADD_SCOPED_ENUM_VALUE(SelfHitTestInvisible)
                END_EXPORT_ENUM(ESlateVisibility)
                有部分特殊的ENum是直接注册的详见FEnumRegistry::Initialize
    ]]
    self.SelfLevelProperty = "SelfLevelProperty"
    self:UELibTest()
    self:AccessTest()
    self:PropertyLevelTest()
    self:FunctionTest()
    self:AllIndexTest()
    self:DelegateTest()
    self:TArrayTest()

    print(BigStrike.." Initialize "..BigStrike.." End")
end

function TestChild:ReceiveBeginPlay()
    print(BigStrike.." ReceiveBeginPlay "..BigStrike)
    -- 
    self:PropertyLevelTest()
    print(BigStrike.." ReceiveBeginPlay "..BigStrike.." End")
end

function TestChild:UELibTest()
    --[[
        理解访问UELib的规则

        Lua访问UE层的东西，都需要经过UE_Index
        static int UE_Index(lua_State* L)
        {
            -- 1. 首先处理非反射类
                -- 如果是已经注册的非反射类型
                -- 直接去注册这个非反射类型的导出                       void TExportedClassBase<bIsReflected>::Register(lua_State *L)
                    -- 具体流程先注册SuperClass，并且绑定Super
                    -- 根据情况设置__index和__newindex元方法，调用到UnLua::Index应该一定是闭包。
                    -- 设置自己为自己的元表
                    -- 注册属性、函数、胶水函数
                    -- 注意，非反射类型从这个代码逻辑上看是一次性导出的！
                -- LUA_REGISTRYINDEX保存了ClassName的metatable
            -- 2. 如果非反射类没有，那么就去按照UE的命名规则解析         UnLua::FClassRegistry::LoadReflectedType(Name + 1);
                -- 其中U\A\F开头的类型，使用ClassRegistry注册
                -- E开头的类型，使用EnumRegistry注册
        }

        Class类型导出宏
        EXPORT_UNTYPED_CLASS(Name, bIsReflected, Lib)               -- 是否反射由bIsReflected控制
        BEGIN_EXPORT_CLASS(Type, ...)                               -- 非反射导出                       这个可以进行手动胶水，参考FSoftObjectPtr的导出
        BEGIN_EXPORT_CLASS_WITH_SUPER(Type, SuperType, ...)         -- 非反射导出
        BEGIN_EXPORT_REFLECTED_CLASS(Type, ...)                     -- 反射导出                         这个可以进行手动胶水，参考UClass导出
    ]]

    print(SmallStrike.." UE Lib Test "..SmallStrike)
    print("[UnLuaTest UELib] UE")                                                                          -- UnLua::UELib::Open函数逻辑
    print("[UnLuaTest UELib]     UE                                 "   , UE)                               -- lua_newtable(L)                      创建的表
                                                                                                                    -- lua_setglobal(L, NAMESPACE_NAME)     并且放入了全局表，所以这里才能直接通过"UE"访问
    print("[UnLuaTest UELib]     UE metatable                       "   , getmetatable(UE))                 -- lua_setmetatable(L, -2)              元表是自己
    print("[UnLuaTest UELib]     UE __index                         "   , getmetatable(UE).__index)         -- lua_rawset(L, -3)                    __index是UE_Index函数
    print("[UnLuaTest UELib]     UE.LoadObject                      "   , UE.LoadObject)                    -- luaL_setfuncs(L, UE_Functions, 0)    下面三个函数luaL_setfuncs设置的UE_Functions
    print("[UnLuaTest UELib]     UE.LoadClass                       "   , UE.LoadClass)                     --
    print("[UnLuaTest UELib]     UE.NewObject                       "   , UE.NewObject)                     -- 并且这三个也放入了全局表

    -- 通过UE_Index访问的导出类型，几种不同的导出情况
    -- 当然，UnLua层做的手动导出还有很多，具体可以搜索void ExportClass(IExportedClass* Class)的引用，甚至还有一个UUnLuaLatentAction
    print("[UnLuaTest UELib]     UE.int32                           "   , UE.int32)                         -- EXPORT_PRIMITIVE_TYPE(int32, TPrimitiveTypeWrapper<int32>, int32)
    print("[UnLuaTest UELib]     UE.TArray                          "   , UE.TArray)                        -- EXPORT_UNTYPED_CLASS(TArray, false, TArrayLib)
    print("[UnLuaTest UELib]     UE.TArray.Length                   "   , UE.TArray.Length)                 --     上面的Lib函数
    print("[UnLuaTest UELib]     UE.TArray()                        "   , UE.TArray(UE.int32))              --     上面的Lib函数 本质上对应了Lib里面的__call元方法，注意，__call的第一个参数是table本身，通过胶水代码知道第二个参数是类型
    print("[UnLuaTest UELib]     UE.UClass                          "   , UE.UClass)                        -- BEGIN_EXPORT_REFLECTED_CLASS(UClass)
    print("[UnLuaTest UELib]     UE.UClass.Load                     "   , UE.UClass.Load)                   --     ADD_LIB(UClassLib)
    print("[UnLuaTest UELib]     UE.EKeys                           "   , UE.EKeys)                         -- BEGIN_EXPORT_CLASS(EKeys)
    print("[UnLuaTest UELib]     UE.EKeys.A                         "   , UE.EKeys.A)                       --     ADD_STATIC_PROPERTY(A)
    print("[UnLuaTest UELib]     UE.FSoftObjectPtr                  "   , UE.FSoftObjectPtr)                -- BEGIN_EXPORT_CLASS(FSoftObjectPtr, const UObject*)
    print("[UnLuaTest UELib]     UE.FSoftObjectPtr.IsValid          "   , UE.FSoftObjectPtr.IsValid)        --     ADD_CONST_FUNCTION_EX("IsValid", bool, IsValid)
    print("[UnLuaTest UELib]     UE.UGameplayStatics                "   , UE.UGameplayStatics)              -- 自动导出
    print("[UnLuaTest UELib]     UE.UGameplayStatics.SpawnObject    "   , UE.UGameplayStatics.SpawnObject)  --     自动导出函数

    print(SmallStrike.." UE Lib Test "..SmallStrike.." End")
end

function TestChild:AccessTest()
    --[[
        理解Lua实现面向对象的规则

        Lua本身不支持面向对象编程，但可以通过table和metatable来模拟类和对象的行为。将【self:Func(Params)】访问完全拆解为【self.Func(self, Params)】语法糖更加容易理解。
        1) table：Lua中的table可以用来存储对象的属性和方法。每个对象通常是一个table。
        2) metatable：metatable是一个特殊的table，可以为另一个table定义行为（如方法调用、属性访问等）。通过设置metatable，可以实现类似类的继承和方法重载。
        3) __index元方法：当访问一个table中不存在的键时，Lua会查找该table的metatable中的__index字段。如果__index是一个table，Lua会在该table中查找键；如果__index是一个函数，Lua会调用该函数来处理键的访问。
        
        在UnLua胶水中，TestChild这个UnLua.Class就是作为“Lua类”来使用的。而self仅仅只是一个表
    ]]

    print(SmallStrike.." Access Test "..SmallStrike)
    -- 访问各级属性
    print("[UnLuaTest AccessTest] self                              "   , self)                                         -- 空表
    print("[UnLuaTest AccessTest] getmetatable(self)                "   , getmetatable(self))
    print("[UnLuaTest AccessTest] getmetatable(getmetatable(self))  "   , getmetatable(getmetatable(self)))
    print("[UnLuaTest AccessTest] Raw TestChild                     "   , TestChild)
    print("[UnLuaTest AccessTest] self.Object                       "   , self.Object)
    print("[UnLuaTest AccessTest] self.Overridden                   "   , self.Overridden)

    print(SmallStrike.." Access Test "..SmallStrike.." End")
end

-- 理解UnLua属性访问的层次结构
function TestChild:PropertyLevelTest()
    --[[
        理解UnLua属性访问的层次结构

        Lua 对象的层次结构：
            1) self                                     原生table
            2) getmetatable(self)                       Module的table，其__index和__newindex等实现在UnLuaLib.cpp的LegacySupport的内部文本Index函数
            3) getmetatable(getmetatable(self))         UClass的table，其__index和__newindex等实现在LuaCore.cpp的Class_Index等
            x) self.Super                               继承的父类Module的原生table

        访问属性的顺序：
            1) 先在 self 中查找
            2) 如果未找到，则在 getmetatable(self) 中查找
            3) 如果仍未找到，则在 getmetatable(getmetatable(self)) 中查找 -- 这个未找到的逻辑非常重要，有的时候需要故意不进行访存优化，让它每次都走到这里

        Index函数和下面的实验结果可以一一对应上

        local function Index(t, k)                                  -- 由访问触发，例如t.k
            local mt        = getmetatable(t)                       -- 使用rawget访问阶段，这个阶段主要是为了遍历Lua的继承链
            local super     = mt
            while super do
                local v = rawget(super, k)                              -- 从metatable原数据获取k
                if v ~= nil and not rawequal(v, NotExist) then          -- 如果找到了，并且不是标记为NotExist
                    rawset(t, k, v)                                     -- ！将找到的结果写入t，加速下次访问
                    return v                                            -- 返回找到的结果
                end
                super = rawget(super, "Super")                          -- 遍历Super，即UnLua.Class(...)的继承链
            end
            local p = mt[k]                                         -- 直接访问阶段，使用了元方法访问，通常是Class_Index
            if p ~= nil then                                            -- 如果找到了
                if type(p) == "userdata" then                           -- 如果是userdata，说明是Cpp/Bp属性
                    return GetUProperty(t, p)                           -- ！通过反射获取属性值，这里说明了为什么下面实验中getmetatable(self).BpLevelProperty的结果是TSharedPtr，因为用self访问时，走的逻辑是GetUProperty
                                                                        --   这里不使用访存优化的原因在于，如果缓存了，后续无法再通过metatable走到Cpp/Bp层获取/更新最新值！
                elseif type(p) == "function" then                       -- ！如果是Function则进行访问优化，因为函数不会被修改，可以缓存
                    rawset(t, k, p)
                elseif rawequal(p, NotExist) then                       -- ！如果没找到就是nil
                    return nil
                end
            else
                rawset(mt, k, NotExist)                             -- 标记为nil
            end
            return p
        end

        至此
            一、如果要Lua模仿面向对象，需要一个Module以及一个空表(self)，然后通过metatable把Module关联到self上，这样就可以通过self访问Module的属性和方法了。
            二、如果要Lua访问Cpp/Bp属性，需要在Module里定义一个属性，然后通过self访问时，走到getmetatable(self)的__index阶段，再走到getmetatable(getmetatable(self))的__index阶段，最后通过GetUProperty反射获取属性值。
                可以推导出来，需要一个[self <-> UObject]的映射也就是上文的【t】在Cpp干的事，以及Property描述符也就是上文的【p】在Cpp干的事。
    ]]
    print(SmallStrike.." Property Level Test "..SmallStrike)
    
    print("[UnLuaTest PropertyLevel] Level Address")
    print("[UnLuaTest PropertyLevel]     self                                "   , self)
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , getmetatable(self))
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , getmetatable(getmetatable(self)))

    print("[UnLuaTest PropertyLevel] self Level")
    print("[UnLuaTest PropertyLevel]     self                                "   , self.SelfLevelProperty)
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , getmetatable(self).SelfLevelProperty)                         -- 这里获取不到
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , getmetatable(getmetatable(self)).SelfLevelProperty)           -- 这里获取不到
    
    print("[UnLuaTest PropertyLevel] Module Level")
    print("[UnLuaTest PropertyLevel]     self                                "   , self.ModuleLevelProperty)
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , getmetatable(self).ModuleLevelProperty)             
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , getmetatable(getmetatable(self)).ModuleLevelProperty)         -- 这里获取不到

    print("[UnLuaTest PropertyLevel] Module Parent Level")
    print("[UnLuaTest PropertyLevel]     self                                "   , self.ParentModuleLevelProperty)
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , getmetatable(self).ParentModuleLevelProperty)                 -- 这里获取不到
    print("[UnLuaTest PropertyLevel]     self.Super                          "   , self.Super.ParentModuleLevelProperty)
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , getmetatable(getmetatable(self)).ParentModuleLevelProperty)   -- 这里获取不到

    print("[UnLuaTest PropertyLevel] Cpp/Bp Level")
    print("[UnLuaTest PropertyLevel]     self                                "   , self.BpLevelProperty)                                         -- BeginPlay前无法访问
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , getmetatable(self).BpLevelProperty)                           -- 这里获取到的是TSharedPtr
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , getmetatable(getmetatable(self)).BpLevelProperty)             -- 这里获取到的是TSharedPtr
    print("[UnLuaTest PropertyLevel]     GetUProperty                        "   , GetUProperty(self, getmetatable(self).BpLevelProperty))       -- 上面self.BpLevelProperty在__index的具体行为
                                                                                                                                                 -- Cpp层会去找self的Object，所以这里写self.Object也是有效的
    -- 上面访问完毕之后，查看table内是否有优化访问
    print("[UnLuaTest PropertyLevel] raw [self Level]")
    print("[UnLuaTest PropertyLevel]     self                                "   , rawget(self, "SelfLevelProperty"))
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , rawget(getmetatable(self), "SelfLevelProperty"))                          -- 这里获取不到
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , rawget(getmetatable(getmetatable(self)), "SelfLevelProperty"))            -- 这里获取不到
    
    print("[UnLuaTest PropertyLevel] raw [Module Level]")
    print("[UnLuaTest PropertyLevel]     self                                "   , rawget(self, "ModuleLevelProperty"))
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , rawget(getmetatable(self), "ModuleLevelProperty"))             
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , rawget(getmetatable(getmetatable(self)), "ModuleLevelProperty"))          -- 这里获取不到

    print("[UnLuaTest PropertyLevel] raw [Module Parent Level]")
    print("[UnLuaTest PropertyLevel]     self                                "   , rawget(self, "ParentModuleLevelProperty"))
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , rawget(getmetatable(self), "ParentModuleLevelProperty"))                  -- 这里获取不到
    print("[UnLuaTest PropertyLevel]     self.Super                          "   , rawget(self.Super, "ParentModuleLevelProperty"))
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , rawget(getmetatable(getmetatable(self)), "ParentModuleLevelProperty"))    -- 这里获取不到
    -- 注意这个例子中的访问缓存机制！Cbp层的Property是不可缓存的！不过函数是可以缓存的
    print("[UnLuaTest PropertyLevel] raw [Cpp/Bp Level]")
    print("[UnLuaTest PropertyLevel]     self                                "   , rawget(self, "BpLevelProperty"))                                          -- 这里和上面表现不一样          
    print("[UnLuaTest PropertyLevel]     getmetatable(self)                  "   , rawget(getmetatable(self), "BpLevelProperty"))                            -- 这里和上面表现不一样
    print("[UnLuaTest PropertyLevel]     getmetatable(getmetatable(self))    "   , rawget(getmetatable(getmetatable(self)), "BpLevelProperty"))              -- 这里获取到的是TSharedPtr

    -- 访问Module并修改
    print("[UnLuaTest PropertyLevel] raw [Module Modify]")
    print("[UnLuaTest PropertyLevel]     ModuleModify                            "   , rawget(self, "ModuleModifyProperty"))                                 -- 第一次访问时自己的table没有，第二次访问已经缓存到self了
    print("[UnLuaTest PropertyLevel]     ModuleModify getmetatable(self)         "   , rawget(getmetatable(self), "ModuleModifyProperty"))
    print("[UnLuaTest PropertyLevel]     ModuleModify getmetatable(getmetatable) "   , rawget(getmetatable(getmetatable(self)), "ModuleModifyProperty"))
    print("[UnLuaTest PropertyLevel] Module Modify")
    print("[UnLuaTest PropertyLevel]     ModuleModify                            "   , self.ModuleModifyProperty)
    print("[UnLuaTest PropertyLevel]     ModuleModify getmetatable(self)         "   , getmetatable(self).ModuleModifyProperty)
    print("[UnLuaTest PropertyLevel]     ModuleModify getmetatable(getmetatable) "   , getmetatable(getmetatable(self)).ModuleModifyProperty)
    self.ModuleModifyProperty = self.ModuleModifyProperty + 1

    print(SmallStrike.." Memory Level Test "..SmallStrike.." End")
end

function TestChild:FunctionTest()
    --[[
        理解UnLua属性访问的缓存机制

        上面PropertyLevel里面已经看见了Module层和Cpp/Bp层的属性缓存区别
    ]]

    print(SmallStrike.." Function Test "..SmallStrike)

    -- 首次rawget访问，全空
    print("[UnLuaTest FunctionTest] rawget")
    print("[UnLuaTest FunctionTest]     self.FunctionTest                                   "   , rawget(self, "BpLevelFunction"))                             -- 首次rawget，全空
    print("[UnLuaTest FunctionTest]     getmetatable(self).FunctionTest                     "   , rawget(getmetatable(self), "BpLevelFunction"))               -- 
    print("[UnLuaTest FunctionTest]     getmetatable(getmetatable(self)).FunctionTest       "   , rawget(getmetatable(getmetatable(self)), "BpLevelFunction")) -- 
    -- 首次get访问，走__index逻辑，进行缓存
    print("[UnLuaTest FunctionTest] get")
    print("[UnLuaTest FunctionTest]     self.FunctionTest                                   "   , self.BpLevelFunction)                                        -- 能够访问
    print("[UnLuaTest FunctionTest]     getmetatable(self).FunctionTest                     "   , getmetatable(self).BpLevelFunction)                          -- 能够访问
    print("[UnLuaTest FunctionTest]     getmetatable(getmetatable(self)).FunctionTest       "   , getmetatable(getmetatable(self)).BpLevelFunction)            -- 能够访问
    -- 查看缓存层级结果
    print("[UnLuaTest FunctionTest] rawget")
    print("[UnLuaTest FunctionTest]     self.FunctionTest                                   "   , rawget(self, "BpLevelFunction"))                             -- 能够访问
    print("[UnLuaTest FunctionTest]     getmetatable(self).FunctionTest                     "   , rawget(getmetatable(self), "BpLevelFunction"))               -- 注意，这里是空
    print("[UnLuaTest FunctionTest]     getmetatable(getmetatable(self)).FunctionTest       "   , rawget(getmetatable(getmetatable(self)), "BpLevelFunction")) -- 能够访问

    print(SmallStrike.." Function Test "..SmallStrike.." End")
end

function TestChild:AllIndexTest()
    --[[
        理解UnLua层复杂的__index函数种类

        UnLua
        UE
        self
        getmetatable(self)
    ]]

    print(SmallStrike.." All Index Test "..SmallStrike)

    print("[UnLuaTest AllIndexTest] self                                                "   , rawget(getmetatable(self), "__index"))                    -- UnLuaLib.cpp的LegacySupport函数里面有描述
    print("[UnLuaTest AllIndexTest] getmetatable(self)                                  "   , rawget(getmetatable(getmetatable(self)), "__index"))      -- 注册Class到Lua层的时候，设置的Class_Index方法
    print("[UnLuaTest AllIndexTest] self.Object                                         "   , rawget(getmetatable(self.Object), "__index"))             -- 
    print("[UnLuaTest AllIndexTest] UE                                                  "   , rawget(getmetatable(UE), "__index"))                      -- UnLua::UELib::Open设置的UE_Index函数
    print("[UnLuaTest AllIndexTest] UE.UGameplayStatics                                 "   , rawget(getmetatable(UE.UGameplayStatics), "__index"))     -- 同Class_Index
    print("[UnLuaTest AllIndexTest] UnLua                                               "   , rawget(getmetatable(UnLua), "__index"))                   -- UnLuaLib.cpp的Open函数里面有描述
    -- 手动注册的其他的__index函数
    print("[UnLuaTest AllIndexTest] UE.TArray                                           "   , rawget(getmetatable(UE.TArray), "__index"))               -- TArray_Index
    print("[UnLuaTest AllIndexTest] UE.ECollisionChannel                                "   , rawget(getmetatable(UE.ECollisionChannel), "__index"))    -- ECollisionChannel_Index
    print("[UnLuaTest AllIndexTest] UE.EObjectTypeQuery                                 "   , rawget(getmetatable(UE.EObjectTypeQuery), "__index"))     -- EObjectTypeQuery_Index
    print("[UnLuaTest AllIndexTest] UE.ETraceTypeQuery                                  "   , rawget(getmetatable(UE.ETraceTypeQuery), "__index"))      -- ETraceTypeQuery_Index
    -- 这三个理应都走UnLua::Index，但是为什么地址不一样呢？因为生成了一个闭包！ void TExportedClassBase<bIsReflected>::Register(lua_State *L)
    -- lua_pushcclosure(L, UnLua::Index, 1)
    print("[UnLuaTest AllIndexTest] UE.EKeys                                            "   , rawget(getmetatable(UE.EKeys), "__index"))                -- 可以尝试访问一个不存在的Key去断点UnLua::Index
    print("[UnLuaTest AllIndexTest] UE.int8                                             "   , rawget(getmetatable(UE.int8), "__index"))
    print("[UnLuaTest AllIndexTest] UE.int16                                            "   , rawget(getmetatable(UE.int16), "__index"))

    print(SmallStrike.." All Index Test "..SmallStrike.." End")
end

function TestChild:DelegateTest()
    print(SmallStrike.."Delegate Test"..SmallStrike)

    print("[UnLuaTest DelegateTest] self                                                "   , self.OnClicked)

    print(SmallStrike.."Delegate Test"..SmallStrike.."End")
end

function TestChild:TArrayTest()
    --[[
        测试Cpp函数
        void UWGGBlueprintLibrary::PrintArray(const TArray<int32>& Array)
        {
            for (int32 i = 0; i < Array.Num(); i++)
            {
                UE_LOG(LogTemp, Warning, TEXT("Array[%d] = %d"), i, Array[i]);
            }
        }

        结论就是不建议这么操作
    ]]
    if UE.UWGGBlueprintLibrary == nil or UE.UWGGBlueprintLibrary.PrintArray == nil then
        print("[UnLuaTest DelegateTest] 未定义Cpp函数")
        return
    end
    
    local TestWithType = function (UEType)
        print("[UnLuaTest DelegateTest] ", UEType.__name)
        local Array = UE.TArray(UEType)
        UE.TArray.Add(Array, 10)
        UE.TArray.Add(Array, 100)
        UE.TArray.Add(Array, 1000)
        UE.UWGGBlueprintLibrary.PrintArray(Array)
    end
    
    local TestWithVectorType = function (UEVectorType)
        print("[UnLuaTest DelegateTest] ", UEVectorType.__name)
        local Array = UE.TArray(UEVectorType)
        UE.TArray.Add(Array, UEVectorType(1, 2, 3))
        UE.TArray.Add(Array, UEVectorType(4, 5, 6))
        UE.TArray.Add(Array, UEVectorType(7, 8, 9))
        UE.UWGGBlueprintLibrary.PrintArray(Array)
    end

    TestWithType(UE.bool)
    TestWithType(UE.int8)
    TestWithType(UE.int16)
    TestWithType(UE.int32)
    TestWithType(UE.int64)
    TestWithType(UE.float)
    TestWithType(UE.double)
    
    TestWithVectorType(UE.FIntVector)
    TestWithVectorType(UE.FVector)
end

return TestChild