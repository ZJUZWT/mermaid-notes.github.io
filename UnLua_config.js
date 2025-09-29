// ==================================================================
// --- CONFIGURATION FILE ---
//  在这里修改图表结构和节点内容
// ==================================================================

const CONFIG = {
    // --- UI 显示文本配置 ---
    uiStrings: {
        mainTitle: "Unlua",
        dragHint: "(按住 Alt + 左键拖拽画布)",
        searchPlaceholder: "搜索变量/方法 (支持多词)",
        themeToggleButton: "切换主题",
        detailsTitle: "详情",
        variablesTitle: "相关变量 (Variables)",
        methodsTitle: "相关方法 (Methods)",
        searchResultsTitle: (count) => `搜索结果 (${count} 条)`,
        noResults: "没有找到匹配项。",
        copySuccessToast: "函数签名已复制!",
        copyFailToast: "复制失败"
    },

    // --- 图表定义 (支持多个) ---
    diagrams: [
        // {
        //     title: "概述",
        //     definition: `
        //         graph
        //     `
        // },
        {
            title: "Unlua框架 核心类型",
            definition: `
                graph

                subgraph UE层
                    UEnum[UEnum<br>需要导出<br>FEnumRegistry::Initialize可以导出<br>BEGIN_EXPORT_ENUM也可以导出]

                    UScriptStruct
                    UClass

                    FProperty
                    UFunction

                    TFunction
                end
                UEnum --->|注册<br>FEnumRegistry::Register| FEnumRegistry
                FProperty ---> FPropertyDesc
                UFunction ---> FFunctionDesc
                UScriptStruct ---> FClassDesc
                UClass ---> FClassDesc
                UE层 ---> 静态导出

                subgraph UnLua层[UnLua层<br>FLuaEnv]
                    direction LR

                    subgraph 静态导出[静态导出<br>这部分模板满天飞]
                        FExported[FExported<br>静态手动导出<br>在FLuaEnv::FLuaEnv注册]

                        subgraph IExportedClass类
                            IExportedClass
                            --> |派生| TExportedClassBase[TExportedClassBase<br>元表相关]
                            --> |派生| TExportedClass
                        end
                        IExportedClass类      --> FExported

                        subgraph IExportedFunction类
                            IExportedFunction --> |派生| TConstructor
                            IExportedFunction --> |派生| TExportedFunction --> |派生| TExportedStaticMemberFunction
                            IExportedFunction --> |派生| TExportedMemberFunction
                            IExportedFunction --> |派生| TSmartPtrConstructor
                        end
                        IExportedFunction类     --> FExported
                        IExportedEnum           --> FExported
                    end

                    subgraph 反射访问
                        FFieldDesc[FFieldDesc<br>导出到Class元表<br>是Property和Function的索引]      --> |以Fields存在于<br>其中包含了Property和Function| FClassDesc
                        FPropertyDesc   --> |以Fields存在于<br>其中包含了Property和Function| FClassDesc
                        FFunctionDesc   --> |以Fields存在于<br>其中包含了Property和Function| FClassDesc

                        FEnumDesc       --> FEnumRegistry
                        FClassDesc      --> FClassRegistry[FClassRegistry<br>元表相关]
                    end
                end
                反射访问 ---->|提供元表| Lua层
                静态导出 ---->|提供元表| Lua层

                subgraph Lua层
                    direction TB

                    Enum访问[访问Enum<br>UE.EnumName]
                    Property访问[访问Property<br>self.CppBpProperty]
                    Function访问[访问Function<br>self:CppBpFunction&lpar;...&rpar;]
                    LatentAction访问[coroutine访问LatentAction]
                end
            `
        },
        {
            title: `1-启动`,
            definition: `
            sequenceDiagram

            participant A as UnLuaModule
            participant B as ULuaEnvLocator
            participant C as FLuaEnv
            participant D as UELib
            participant E as FClassRegistry
            participant F as TExportedClassBase
            participant G as UnLuaLib

            participant Z as Engine

            Note Right of Z : 引擎启动的时候会去Dll里面Load<br>ReflectedClasses<br>NonReflectedClasses

            Z ->>+ A : 接广播OnPreBeginPIE
            Note Right of A : 设置状态

                A ->>+ A : void SetActive(const bool bActive)
                    alt bActive设置为True
                        Note Right of A : 添加ErrorDelegate
                        Note Right of A : 添加Object Create/Delete Listener<br>也就是蓝图覆盖中的第一步<br>NotifyUObjectCreated()
                        Note Right of A : 创建UnLuaSetting
                        Note Right of A : 创建EnvLocator<br>并且执行EnvLocator->AddToRoot()<br>防止GC
                        loop 遍历所有的UClass与Setting.PreBindClass进行比较，如果Class->IsChildOf(PreBindClass)
                            Note Right of A : 那么就用Locator去Locate Env，然后用Env TryBind<br>Env就相当于一个LuaState，并且有自己的Registry

                            A ->>+ B : ULuaEnvLocator::Locate(const UObject* Object)
                                Note Right of B : ULuaEnvLocator拥有一个Env<br>TSharedPtr<UnLua::FLuaEnv, ESPMode::ThreadSafe> Env;
                                alt 如果此时Locator没有Env
                                rect rgb(100, 100, 100)
                                    Note Right of B : 创建一个Shared Env

                                    B ->>+ C : FLuaEnv::FLuaEnv()
                                        Note Right of C : 注册Delegates
                                        Note Right of C : 创建新的Lua环境<br>lua_newstate(GetLuaAllocator(), nullptr)
                                        Note Right of C : 把新建的lua_states加入到AllEnv中
                                        Note Right of C : 初始化Lua库
                                        Note Right of C : 添加三个Searcher
                                        Note Right of C : 添加UE支持

                                        C ->>+ D : UnLua::UELib::Open(lua_State* L)
                                            Note Right of D : 创建一个表A<br>设置其__index方法A[__index] = UE_Index
                                            Note Right of D : 设置A的Metatable为A
                                            Note Right of D : 设置LUA_REGISTRY[UnLua_UELib] = A<br>这个值在REGISTRY里面，只能Cpp侧访问到
                                            Note Right of D : 设置LoadObject/LoadClass/NewObject函数到A<br>并且设置A到lua侧Global表 UE = A
                                            Note Right of D : 兼容旧版本<br>设置上面几个函数到_G表<br>将UE表做个别名UE4放在Global

                                        D ->>- C : return
                                        Note Right of C : 创建各种Cpp部分的Registry并且存放Env为自己<br>FObjectRegistry<br>FClassRegistry<br>FFunctionRegistry<br>FDelegateRegistry<br>FContainerRegistry<br>FPropertyRegistry<br>FEnumRegistry

                                        C ->>+ E : ClassRegistry->Register("UObject")<br>ClassRegistry->Register("UClass")

                                            E ->>+ E : FClassRegistry::PushMetatable(lua_State* L, const char* MetatableName)
                                                alt 如果这个MetatableName已经注册成Table了
                                                    Note Right of E : 去全局的Name2Classes表中查看全局表中的内容是否Valid<br>如果不Valid那么就清除<br>FClassRegistry::Unregister(const FClassDesc* ClassDesc)<br>里面提供了lua侧的注销                       <br>如果Valid就直接return true
                                                else 这个仍然还没有注册 
                                                    Note Right of E : 
                                                end
                                                Note Right of E : FindExportedNonReflectedClass如果是非反射的Class<br>return false

                                                E ->>+ E : FClassDesc* FClassRegistry::RegisterReflectedType(const char* MetatableName)
                                                    Note Right of E : 先还是去Name2Classes里面找有没有
                                                    Note Right of E : 如果有的话，就需要去Classes表中看有没有<br>有的话就直接返回查找到的结果
                                                    Note Right of E : 没有就需要去注册
                                                    Note Right of E : 去掉U/A/F首位修饰词<br>在LoadReflectedType(TypeName)找到对应的UField<br>再Cast到UStruct，如果可行<br>那么就按照Struct和Name注册到Classes和Name2Classes

                                                E ->>- E : 
                                                Note Right of E : 在Lua侧创建一个MetatableName的metatable B<br>这个就是Class的Metatable<br>也就是代码中的二级metatable
                                                Note Right of E : B[__index] = Class_Index<br>B[__newindex] = Class_NewIndex<br>B[TypeHash] = UStruct地址<br>B[ClassDesc] = LUD{ClassDesc}<br>B[StaticClass] = Class_StaticClass(LUD{ClassDesc})<br>B[Cast] = Class_Cast<br>B[__eq] = UObject_Identical<br>B[__gc] = UObject_Delete
                                                Note Right of E : 如果是ScriptStruct，需要覆写一些功能<br>B[__index] = ScriptStruct_Index<br>B[Copy] = ScriptStruct_Copy(LUD{ClassDesc})<br>B[CopyFrom] = ScriptStruct_CopyFrom(LUD{ClassDesc})<br>B[__eq] = ScriptStruct_Compare(LUD{ClassDesc})<br>B[__gc] = ScriptStruct_Delete(LUD{ClassDesc})<br>B[__call] = ScriptStruct_New(LUD{ClassDesc})
                                                Note Right of E : set metatable to self
                                                Note Right of E : 获取整个继承链条ClassDesc->GetInheritanceChain(ClassDescChain)<br>并且如果是Reflected，再把其父类信息注册给B

                                                    E ->>+ F : TExportedClassBase<bIsReflected>::Register(lua_State *L)
                                                        alt 如果bIsReflected为True
                                                            Note Right of F : 那么这个函数需要保证需要填充的<br>Metatable表在栈顶，这个时候会将ExportedClass信息存到Lua侧
                                                        else 如果bIsReflected为False
                                                            Note Right of F : 除了上面的步骤，还会自己构造Metatable并且Set到UE表
                                                        end
                                                    F ->>- E : return
                                                
                                                E ->>+ D : UnLua::UELib::SetTableForClass(lua_State* L, const char* Name)
                                                    Note Right of D : 将之前注册的B ClassMetatable注册到Lua侧UE表中
                                                D ->>- E : return

                                            E ->>- E : return 
                                            
                                        E ->>- C : return Name2Classes.FindChecked(Key)检查是否创建成功
                                        Note Right of C : 创建Lua侧的表，并且是Weak表<br>StructMap\ArrayMap<br>lua_pushstring(L, "StructMap")<br>LowLevel::CreateWeakValueTable(L)<br>lua_rawset(L, LUA_REGISTRYINDEX)
                                        
                                        Note Right of C : 注册所有NonReflectedClass<br>整体来说就是ExportedNonReflectedClasses里面存了<br>String->UnLua::IExportedClass的映射<br>UnLua::IExportedClass里面保存了<br>bIsReflected, Name, SuperClassName, Property<br>Function, GlueFunctions等信息，这些信息都是类里面的<br>其生成依赖LuaLib_开头的文件，类似反射宏的形式<br>详细的宏可以见UnLuaEx.h，Static数据只在开Editor加载一次

                                        C ->>+ F : Pair.Value->Register(L)
                                            Note Right of F: 与上面的函数相同，这里增加更多细节<br>需要注册到Lua侧有三种，Property、MemberFunc、GlueFunc<br>这几个的实现底层逻辑都是，保证目前要注入的Metatable在栈顶<br>然后将自己携带的信息注入Lua
                                        F ->>- C : return

                                        Note Right of C : 注册所有ExportedFunctions<br>同上，主要的宏是EXPORT_FUNCTION(_EX)
                                        Note Right of C : 注册所有ExportedEnums<br>同上，主要的宏是BEGIN_EXPORT_ENUM(_EX)

                                        C ->>+ G : UnLuaLib::Open(lua_State* L)
                                            Note Right of G : 重载print函数
                                            Note Right of G : 加载Unlua模块，luaL_requiref会在<br>package.loaded["Unlua"]为nil的情况下执行LuaOpen
                                            Note Right of G : 给Unlua表提供一个__index内置判空
                                            Note Right of G : LegacySupport<br>注册Lua侧Class函数，也就是ModuleMetatable<br>其中Index和NewIndex是"self"中真正第一层使用的函数<br>具体可见GetSetValue章
                                            Note Right of G : LegacySupport<br>给Lua侧注入UEPrint、GetUProperty、SetUProperty
                                        G ->>- C : 

                                    C ->>- B : return

                                    Note Right of B : 至此，创建了一个完整的LuaEnv<br>我们已经准备好了所有的数据<br>注册了所有的Static信息以及一些必要的函数和类
                                end
                                else 现在已经有一个Env
                                    Note Right of B : 直接使用现有的Env
                                end
                            B ->>- A : return Env

                            A ->>+ C : FLuaEnv::TryBind(UObject* Object)
                                Note Right of C : 第二章会详细说明这个流程，逻辑上是绑定Object到Lua侧<br>这几个基本不会触发里面的逻辑<br>一是这个类不会实现UnluaInterface<br>并且不在GLuaDynamicBinding理面
                            C ->>- A : return
                            
                        end
                    else bActive设置为False
                        Note Right of A : 注销创建时的信息
                    end
                A ->>- A : return

            A ->>- Z : return
            `
        },
        {
            title: '2-创建Object',
            definition: `
            sequenceDiagram

            participant A as FUnLuaModule
            participant B as FLuaEnv
            participant C as UUnluaManager
            participant D as ULuaFunction
            participant E as FLuaOverrides
            participant F as ULuaModuleLocator
            participant G as FObjectRegistry
            participant H as LuaCore

            participant Z as Engine

            Note Right of D : From是原始函数的WeakPtr<br>Overridden是原始函数的一个Copy

            Z ->>+ A : 创建Object时触发广播NotifyUObjectCreated()
                Note Right of A : 

                A ->>+ B : FLuaEnv::TryBind(UObject* Object)

                    B ->>+ F : ULuaModuleLocator::Locate(const UObject* Object)
                        Note Right of F : 通过绑定Interface的GetModuleName函数<br>获取Object对应的Module<br>Execute_GetModuleName<br>这就是UnLua的绑定方式
                    F ->>- B : return

                    B ->>+ C : UUnLuaManager::Bind(UObject *Object, <br>const TCHAR *InModuleName, int32 InitializerTableRef)
                        Note Right of C : 拿LuaEnv里面的lua_state<br>lua_State *L = Env->GetMainState()<br>然后用Class信息去和启动ClassDesc Register走同一个逻辑<br>如果Register不成功直接退出<br>ClassRegistry->Register可以详见第一章<br>主要是在全局创建了对应MetatableName的Metatable<br>这个就是 Class Metatable
                        Note Right of C : 利用"require"检查类型看Module行不行<br>这也是为什么lua文件里面结尾需要return<br>其实上require的实现不仅仅是Load<br>https://blog.csdn.net/qweewqpkn/article/details/49050507<br>这里就是查看Module Metatable

                        C ->>+ C : 如果require出来有效并且是Table<br>UUnLuaManager::BindClass(UClass* Class, <br>const FString& InModuleName, FString& Error)

                            Note Right of C : UnLua::LowLevel::GetLoadedModule根据<br>ModuleName从package.loaded获取Module<br>看是不是Table，此时stack_top是package.loaded[ModuleName]
                            Note Right of C : if (!Class->IsChildOf<UBlueprintFunctionLibrary>())<br>这里面对不是UBlueprintFunctionLibrary的子类进行了Module Metatable的复制<br>然后再push这个值到top，并且去REGISTRY里面搞个引用<br>并且把这个引用保存了下来，后续Cpp想查找就简单了
                            Note Right of C : 获取所有的Lua侧函数UnLua::LowLevel::GetFunctionNames
                            Note Right of C : 获取所有的蓝图侧函数ULuaFunction::GetOverridableFunctions
                            rect rgb(100, 100, 100)
                            Note Right of C : 如果Lua侧的函数名，在蓝图侧也有的话，进行覆盖！

                            C ->>+ D : Call ULuaFunction::Override(UFunction* Function, UClass* Outer, FName NewName)
                                Note Right of D : 单纯调用一下

                                D ->>+ E : Call FLuaOverrides::Override(UFunction* Function, UClass* Class, FName NewName)
                                    Note Right of E : OverridesClass = GetOrAddOverridesClass(Class)<br>新建或者使用已经创建的OverridesClass<br>新建的时候这个类会将Owner设置为原本的Cpp/BP类<br>里面主要保存的是各个Override的Function
                                    Note Right of E : const auto bAddNew = Function->GetOuter() != Class<br>理论上来说，如果不是类自己的函数(继承的也不算自己的)<br>那么就是True<br>举个例子，对于Construct函数，如果蓝图没有实现<br>那么这里获得的就是True<br>如果蓝图有一个自己的版本<br>那么这里拿到的就是False<br>逻辑上来说，如果是False，那么蓝图一定实现了这个函数
                                    Note Right of E : FObjectDuplicationParameters<br>StaticDuplicate将Function传给LuaFunction<br>OverridesClass->Children其实就是一个链表<br>这里的操作是Children链表插入LuaFunction

                                    E ->>+ D : Call ULuaFunction::Override(UFunction* Function, UClass* Class, bool bAddNew)
                                        Note Right of D : UMetaData::CopyMetadata(Function, this)<br>再次复制Metadata，从原始函数到ULuaFunction
                                        alt 如果原始函数是execScriptCallLua
                                            Note Right of D : 
                                        else 否则的话
                                            Note Right of D : 创建一个函数叫做FunctionName+__Overridden<br>然后又用StaticDuplicateObject(Function, GetOuter(), *DestName)复制数据<br>这个逻辑上来说就是为原始函数做了个备份！！！
                                        end

                                        D ->>+ D : Call ULuaFunction::SetActive(const bool bActive)
                                            Note Right of D : const auto Class = Cast<ULuaOverridesClass>(GetOuter())->GetOwner()<br>目前的GetOuter()就是刚刚创建的ULuaOverridesClass<br>ULuaOverridesClass的Owner就是初始化的时候设置的原始Class

                                            Note Right of D : 函数存在Class的两个地方，蓝图实现的函数会在FuncMap中<br>另一个地方时Class->NativeFunctionLookupTable
                                            alt 如果是Active生效
                                                alt 如果是这个Class直接拥有的函数(也就是前文对bAddNew的介绍)
                                                    Note Right of D : 将ULuaFunction的Func设置为execCallLua
                                                    Note Right of D : 因为这个函数不在原始Class的FuncMap里面<br>FuncMap添加Name和自己(this ULuaFunction)
                                                    Note Right of D : 如果这个函数是Native函数<br>Class->AddNativeFunction(*GetName(), &ULuaFunction::execCallLua)<br>将函数加入到Class的NativeFunctionLookupTable
                                                else
                                                    Note Right of D : 先复制一些Function的属性给ULuaFunction<br>相当于还原时需要的副本
                                                    Note Right of D : 因为这个函数肯定在原始Class的FuncMap里面了<br>直接把原始Function改为execScriptCallLua
                                                    Note Right of D : Class->NativeFunctionLookupTable添加Name和execScriptCallLua
                                                    Note Right of D : 在将函数的Script属性改掉，将LUA头和ULuaFunction自己放进去<br>在ULuaFunction::execScriptCallLua里面就可以拿到这个ULuaFunction了<br>具体可以打断点看Stack的信息
                                                end
                                            else 如果是不生效
                                                alt 如果是这个Class直接拥有的函数(也就是前文对bAddNew的介绍)
                                                    Note Right of D : 直接将函数从Class的FuncMap中移除
                                                else
                                                    Note Right of D : 从From获取到原始Function，重置Script信息
                                                    Note Right of D : 用之前Overriden的信息重置函数<br>具体包括了，删除FuncMap<br>额外在Class->NativeFunctionLookupTable增加原始函数<br>这步对LookupTable的操作是bAddNew为True时要多的
                                                end
                                            end

                                        D ->>- D : return

                                    D ->>- E : return

                                E ->>- D : return

                            D ->>- C : return
                            end

                        C ->>- C : return

                    rect rgb(100, 100, 100)
                        Note Right of C : 将Class和Object都注册到ObjectRegistry里面<br>并不清楚为什么Class需要注册成Object<br>https://github.com/Tencent/UnLua/commit/3adc1801c40f990eb279fcb9bce780e675883bce<br>注意之前的都是类型数据，到这里开始我们注册真正能用的self

                        C ->>+ G : FObjectRegistry::Bind(UObject* Object)
                            Note Right of G : 如果ObjectRefs表里面已经注册了Object，直接退出<br>ObjectRefs里面保存了【Cpp实例->Lua实例的RegistryRef】
                            Note Right of G : lua_getfield(L, LUA_REGISTRYINDEX, REGISTRY_KEY)<br>|...| Reg |
                            Note Right of G : lua_pushlightuserdata(L, Object)<br>|...| Reg | lud |<br>这里有个push lightuserdata的操作<br>后面可以看见是在REGSITRY里面做了个映射，但是应该并不是很有用
                            Note Right of G : lua_newtable(L)<br>|...| Reg | lud | self |<br>先将Object新建一个表INSTANCE，这个就是我们lua侧的"self"

                            G ->>+ H : PushObjectCore(lua_State *L, UObjectBaseUtility *Object)
                                Note Right of H : 先根据Object获取MetatableName，比较特殊的<br>如果Object不是Native的，那么其名字是完整的路径
                                Note Right of H : 如果名字有效，再去创建一个NewUserdataWithTwoLvPtrTag
                                Note Right of H : 再根据名字去找对应的Metatable，找到了给Userdata设置上<br>回顾：这个设置是在UUnLuaManager::Bind的第一步执行的
                            H ->>- G : |...| Reg | lud | self | ud |
                            Note Right of G : lua_pushstring(L, "Object")<br>lua_pushvalue(L, -2)<br>lua_rawset(L, -4)<br>|...| Reg | lud | self | ud |<br>一套组合拳，其效果为self.Object = ud
                            Note Right of G : 在前面UUnLuaManager::BindClass中存放的Ref在这里就可以用到了<br>利用Class*去读取GetModuleName的Module Table Ref
                            Note Right of G : lua_rawgeti(L, LUA_REGISTRYINDEX, ClassBoundRef)<br>|...| Reg | lud | self | ud | module |
                            Note Right of G : lua_getmetatable(L, -2)<br>|...| Reg | lud | self | ud | module | cbp_metatable |
                            Note Right of G : lua_pushstring(L, "Overridden")<br>lua_pushvalue(L, -2)<br>lua_rawset(L, -4)<br>|...| Reg | lud | self | ud | module | cbp_metatable |<br>一套组合拳，其效果为module.Overridden = cbp_metatable
                            Note Right of G : lua_setmetatable(L, -2)<br>|...| Reg | lud | self | ud | module |<br>module.metatable = cbp_metatable
                            Note Right of G : lua_setmetatable(L, -3)<br>|...| Reg | lud | self | ud |<br>self.metatable =  module
                            Note Right of G : lua_pop(L, 1)<br>|...| Reg | lud | self |
                            Note Right of G : lua_pushvalue(L, -1)<br>const auto Ret = luaL_ref(L, LUA_REGISTRYINDEX)<br>这里就实现了Object到Lua self的映射
                            Note Right of G : FUnLuaDelegates::OnObjectBinded.Broadcast(Object)发广播
                            Note Right of G : lua_rawset(L, -3)<br>lua_pop(L, 1)<br>|...|<br>在我看来这步已经不是很必要，其操作是Reg.lud = self<br>也就是在REGISTRY里面也绑定了Object和Lua的映射<br>毕竟REGISTRY也只有cpp能用，已经有Classes了
                        G ->>- C : return
                    end

                    Note Right of C : 尝试获取"Initialize"函数的Ref

                    C ->>- B : return 

                B ->>- A : return

            A ->>- Z : return
            `
        },
        {
            title: '3-Get/Set Property',
            definition: `
            sequenceDiagram

            participant A as _G
            participant B as LUA_CLASS
            participant C as LuaCore
            participant D as FClassDesc

            participant Z as Lua

            Note Right of A : static void LegacySupport(lua_State* L)<br>这个函数定义了Lua侧Class的__index，__newindex以及Class<br>在使用self的第一个__index就是走的这个函数

            Z ->>+ B : LUA_CLASS self.INEDX_STR<br>Lua侧，值访问，此时栈中应该是[table, index_str]，如果查找不到，需要调用Metatable的__index方法

                rect rgb(100, 100, 100)
                Note Right of B : self调用，此时metatable是LuaClass的table<br>调用其__index函数，定义在LegacySupport里面
                Note Right of B : 逻辑是迭代metatable寻找rawget(super, k)<br>如果找到,那么把这个值加到self上，并且return<br>这里能set到self的原因是，第一层metatable是纯lua侧的
                Note Right of B : <br>如果找不到会利用metatable.metatable的__index去找local p = mt[k]<br>其__index通常被设置为Class_Index，__newindex则是Class_NewIndex<br>通过这个方法找到的，只有函数才加到self身上，如果Property加了那么就再也无法调用到__newindex或者__index了
                end
                
                B ->>+ C : 无法在Lua侧第一层Metatable找到需要的值，那么去Class Table侧的__index函数 Class_Index(lua_State *L)
                    Note Right of C : Class_Index(lua_State *L)<br>此时的栈里面的Table已经是self.metatable了<br>也就是ModuleTable，他的Metatable也就是ClassTable

                    C ->>+ C : GetField(lua_State* L)
                        Note Right of C : 先尝试rawget, 这里就可以利用cache在Class metatable上优化性能

                        C ->>+ C : 如果rawget没有的话，说明这个值一次都没有读取过，执行GetFieldInternal GetFieldInternal(lua_State* L)
                            Note Right of C : 注意，进来这个函数的时候，LuaC栈如下所示<br>| ... | Table | Index_str | Metatable | get_result |
                            Note Right of C : 通过metatable.__name弄出ClassName<br>通过栈2号直接获得FieldName
                            Note Right of C : 通过FClassRegistry找到ClassName对应的ClassDesc<br>逻辑详见第一章ClassRegistry->Register
                            
                            C ->>+ D : 通过ClassDesc找到FieldDesc<br>FClassDesc::RegisterField(FName FieldName, FClassDesc* QueryClass)

                                Note Right of D : 首先先尝试Load Class*保证Class是有效的<br>然后再去ClassDesc的Fields里面直接找有没有这玩意<br> 如果有就直接返回了
                                Note Right of D : 我们第一次访问的时候肯定是没有的<br>这里对于Lua来说Property和Function都是相同的访问方式<br>所以这里先尝试在Struct里面Property，然后又去找Function<br>如果两个能找到一个就说明是有效的

                                Note Right of D : 利用获取到的值，去拿到OuterStruct<br>将这个Field注册到正确的，最外层的类<br>这里就是执行了一个类似Super的操作
                                Note Right of D : 新建FieldDesc，保存要拿的QueryClass<br>目前注册的OuterClass<br>然后加入到ClassDesc的Fields里面，下次就可以直接用了

                                Note Right of D : 最后Property和Function分别放到ClassDesc的Properties和Functions<br>这个时候将FieldDesc的Index补充完整<br>并且将Function的Index设置成负数，这样就可以利用Index判断类型了

                            D ->>- C : return FieldDesc

                            Note Right of C : 如果Field的描述符是有效的话<br>接下来我们需要将这个值传到Lua侧<br>这里对继承的量还有一些处理<br>总的来说，就是拿到Field刚刚设置的OuterClass，再看看有没有已经Cache的结果
                            Note Right of C : 如果没有Cached，我们需要Cache这个值

                            C ->>+ C : PushField(lua_State *L, TSharedPtr<FFieldDesc> Field)

                                Note Right of C : Field->As***这函数就是拿到自己存的OuterClassDesc，然后在根据Index去拿对应的Desc
                                Note Right of C : 然后将这个值Push到LuaC栈上<br>不过特别需要注意的是，Push的值是TSharedPtr<T><br>也就是在lua栈上存的是一个存放TSharedPtr的userdata<br>然后将这个ud放到名为TSharedPtr的metatable上

                                Note Right of C : 如果这个是Function，还需要额外的一步<br>因为我们需要实现Lua侧调用C函数<br>所以我们有了Function的Ptr还不够，需要提供一个cclosure<br>这个cclosure调用的时候，会将upvalue设置为刚刚的SharedPtr<br>后面第五章，就是这两个函数的秀场了

                            C ->>- C : return

                            Note Right of C : 再将这个值Cache到Lua侧的Class Table上，万事大吉
                            
                        C ->>- C : return

                    C ->>- C : return

                    Note Right of C : 目前栈顶就是我们刚刚获取的Value
                    
                    alt 如果这个值不是userdata
                        Note Right of C : 说明可以返回了
                    else 如果这个值是userdata
                        Note Right of C : 说明这个值可能是某个Property的TSharedPtr Desc
                        alt 如果TSharedPtr Cast失败了
                            Note Right of C : 说明寄了
                        else 如果Cast成功了
                            Note Right of C : 去看Module Table上面能不能找到CppInstance
                            alt 如果找不到，可能是类的值
                                Note Right of C : 认为成功了
                            else 如果找到了
                                Note Right of C : 去CppInstance里面读Value
                            end
                        end
                    end

                C ->>- B : return

            B ->>- Z : return value

            Note Right of A : 这样设计避免了self或者ModuleTable拿到蓝图、Cpp侧变量<br>导致无法使用__index与__newindex继续访问
            `
        },
        {
            title: '4-Cbp调用Lua',
            definition: `
            sequenceDiagram

            participant A as ULuaFunction
            participant B as FFunctionRegistry
            participant C as FFunctionDesc

            participant Z as Cpp

            Z ->>+ A : 调用蓝图未实现的，并且被Lua覆盖的函数ULuaFunction::execCallLua<br>调用蓝图实现的，并且被Lua覆盖的函数ULuaFunction::execScriptCallLua
                Note Right of A: Stack.CurrentNativeFunction: 对应之前创建的ULuaFunction<br>Stack.Object: 对应调用函数的UObject<br>Stack.Code :这个玩意就是"LUA",对应ScriptMagicHeader<br>Context和Stack.Object一致<br>具体怎么来的可以看章节 2的ULuaFunction::Override
                
                A ->>+ B : FFunctionRegistry::Invoke(ULuaFunction* Function, UObject* Context, FFrame& Stack, RESULT_DECL)
                
                rect rgb(100, 100, 100)
                    Note Right of B : 利用ObjectRefs，查找目前的Object对应的REGSITRY ref<br>没有ref说明这个Object都没有对应的Lua实例
                    Note Right of B : 先去this->LuaFunctions里面去找有没有这个函数存着的信息
                    alt 没有这个ULuaFunction
                        Note Right of B : 初始化FuncRef为NOREF<br>以及FuncDesc为UFunction新建的描述符

                        B ->>+ C : FFunctionDesc::FFunctionDesc(UFunction *InFunction, FParameterCollection *InDefaultParams)
                            Note Right of C : 初始化FunctionDesc
                            Note Right of C : 拿到Function*，FunctionName，ParamsSize<br>设置对应的LuaFunctionName，如果是网络的应该加_RPC
                        C ->>- B : return

                        Note Right of B : 接下来这一大段LuaC的意思就是<br>先搞到lua侧的self，然后找到他的metatable，也就是Module table<br>不断地查看表里面有没有这个函数，如果没有，就去他的Super上面找<br>找到了，此时Function在栈顶，把他去Ref一下，Cpp侧后面会保存这个Ref

                    else 有这个ULuaFunction
                        Note Right of B : 那么Function的信息就直接取存起来的信息
                    end
                end

                rect rgb(100, 100, 100)
                    B ->>+ C : FFunctionDesc::CallLua(lua_State* L, lua_Integer FunctionRef, lua_Integer SelfRef, FFrame& Stack, RESULT_DECL)
                        Note Right of C : 先进行一系列Check操作
                        Note Right of C : 这里是第一个比较抽象的地方，主要是对BP实现的模仿<br>其实现是从BP VM Stack中读取Property<br>是仿造的ProcessScriptFunction UE原生函数<br>遍历Function->ChildProperties，并且将InParms视作一个存放数据的Buffer<br>然后每读到一个Property，都执行<br>Stack.Step(Stack.Object, Property->ContainerPtrToValuePtr<uint8>(InParms))<br>也就是告诉Stack把Param存到InParms里面,根据Property计算出来的存放位置<br>如果这个Property还是Output，那么会创造一个Output链表
                        Note Right of C : 这个循环里面基本上和BP VM的源码一样，里面有个很特殊的量<br>Stack.MostRecentPropertyAddress<br>以我的理解来看，这个就是提供这个Property应该放值的位置<br>注意，因为每次Step之后，MostRecentProperty都会被修改<br>所以其实这样存下来，每个Property都能保存对应的Addr

                        C ->>+ C : FFunctionDesc::CallLuaInternal(lua_State *L, void *InParams, FOutParmRec *OutParams, void *RetValueAddress)
                            Note Right of C : 这里注释也很明显，目前栈的情况是<br>|...| ErrorFunc | FuncToCall | self |<br>我们目前核心依赖的就是lua_pcall去调用<br>https://pgl.yoyo.org/luai/i/lua_call<br>https://pgl.yoyo.org/luai/i/lua_pcall
                            Note Right of C : 如果有InParams这个Container，那么遍历Property<br>如果不是ReturnParam，那么就执行读取，并且压入Lua<br>ReadValue_InContainer
                            Note Right of C : 根据Params的数量和Self，设置pcall调用参数<br>需要注意的是，这里把Output也放进去了。。。不知道为什么
                            Note Right of C : 根据NumParams和栈，执行pcall
                            Note Right of C : 根据执行完之后的栈顶和之前存的top进行求差<br>以此获得栈上的返回数据
                            Note Right of C : 遍历之前保存的OutProperty对应的所有Indices<br>拿到一个OutProperty之后，去前面处理出来的Out链表中找到对应的OutParamRec<br>有了这个之后，可以按照之前存下来的PropAddr存回，这里就是Property写回操作了
                        C ->>- C : return
                        
                    C ->>- B : return
                end
                
                B ->>- A : return

                Note Right of A : 总的来说，基本逻辑就是蓝图调用函数层转发到exec(Script)CallLua<br>再根据函数信息与目前的蓝图Stack，仿照ProcessScriptFunction的逻辑执行函数<br>额外增加的是与Lua栈的交互部分(包括存取值，以及pcall)

            A ->>- Z : return
            `
        },
        {
            title: '5-Lua调用Cbp',
            definition: `
            sequenceDiagram

            participant A as LuaCore
            participant B as FFunctionDesc

            participant Z as Lua

            Z ->>+ A : Lua会调用cclosure，这个时候<br>upvalue[1]被设置为了cpp函数的TSharedPtr<br>Class_CallUFunction(lua_State *L)

                Note Right of A : 从upvalue中拿到FunctionDesc的指针
                Note Right of A : 如果失效了就不执行了

                A ->>+ B : 查看无误，去执行<br>FFunctionDesc::CallUE(lua_State *L, int32 NumParams, void *Userdata)
                    Note Right of B : 先对函数类型整理一下使用的Object<br>如果是Static，Object用Default<br>如果有参数，Object用第一个参数
                    Note Right of B : 预处理函数参数PreCall
                    Note Right of B : 搞到FinalFunction<br>这里InterfaceFunc还有待考究

                    Note Right of B : 获取到Function对应的ULuaFunction，这里有之前Create时保存的副本<br>第二章搜__Overridden<br>如果Function可以弄到Overridden，那么就把FinalFunction改成原始副本

                    Note Right of B : 后面就是两个Call<br>UObject::ProcessEvent( UFunction* Function, void* Parms)
                B ->>- A : 

            A ->>- Z : return
            `
        }
    ],

    // --- 在这里配置每个节点的详细信息 ---
    // 注意: nodeDetails 是全局共享的, 所有图表的节点ID都从这里查找
    nodeDetails: {
        'FEnumRegistry': { title: 'FEnumRegistry', 
            variables: [
                { name: 'Enums', type: 'TMap&lt;UEnum*, FEnumDesc*&gt;', desc: '<strong>Cpp枚举类</strong>映射到<strong>UnLua描述符</strong>'},
                { name: 'Name2Enums', type: 'TMap&lt;FString, FEnumDesc*&gt', desc: '<strong>Cpp枚举名字</strong>映射到<strong>UnLua描述符</strong>'}
            ],
            methods: [
                {
                    name: 'Register',
                    desc: `将Cpp层的UEnum枚举注册到Lua层，并且在UnLua层保留一个FEnumDesc索引<ul>
                        <li> 将Enum的名字注册到LUA_REGISTRYINDEX，使用luaL_newmetatable函数的时候会自动写入__name </li>
                        <li> 将Enum这个Object注册到LUA_REGISTRYINDEX的UnLua_ObjectMap </li>
                        <li> 将胶水函数放到metatable，大部分胶水函数里面都依赖__name </li>
                    </ul>
                    `,
                    signature: 'FEnumDesc* Register(UEnum* Enum, lua_CFunction IndexFunc = nullptr)'
                }
            ]
        },
        'FClassRegistry': { title: 'FClassRegistry',
            variables: [
                { name: 'Enums', type: 'TMap&lt;UStruct*, FClassDesc*&gt;', desc: '<strong>Cpp/Bp类</strong>映射到<strong>UnLua描述符</strong>'},
                { name: 'Name2Enums', type: 'TMap&lt;FString, FClassDesc*&gt', desc: '<strong>Cpp/Bp类名字</strong>映射到<strong>UnLua描述符</strong>'}
            ],
            methods: [
                {
                    name: 'Register',
                    desc: `主要是调用PushMetatable`,
                    signature: 'FClassDesc* Register(const char* MetatableName)'
                },
                {
                    name: '【注册元表】PushMetatable',
                    desc: `将Cpp层的类型做成metatable，这个操作不适用于非反射导出<ul>
                        <li> 注册有两个阶段，第一个阶段是注册UnLua层的FClassDesc，第二个阶段是伪造Lua面向对象注册metatable。 </li>
                        <li> 注册metatable的时候，会注册元方法，给Lua层跳到Cpp层进行访问。</li>
                    </ul>
                    `,
                    signature: 'bool PushMetatable(lua_State* L, const char* MetatableName)'
                }
            ]
        },
        'FClassDesc': { title: 'FClassDesc',
            variables: [
                { name: 'Fields', type: 'TMap&lt;FName, TSharedPtr&lt;FFieldDesc&gt;&gt;', desc: '描述当前Class可以访问的Field，包括了Property和Function，用Lua的思维可以很容易理解这个。'},
                { name: 'Properties', type: 'TArray&lt;TSharedPtr&lt;FPropertyDesc&gt;&gt;', desc: '描述当前Class可以访问的Property，通过Field间接索引访问'},
                { name: 'Functions', type: 'TArray&lt;TSharedPtr&lt;FFunctionDesc&gt;&gt;', desc: '描述当前Class可以访问的Function，通过Field间接索引访问'},
                { name: 'SuperClasses', type: 'TArray&lt;FClassDesc*&gt;', desc: '描述当前Class的父类，注意是Cpp/Bp层的父类，不是'},
            ]
        },

        'FFieldDesc': { title: 'FFieldDesc',
            variables: [
                { name: 'FieldIndex', type: 'int32', desc: '这个Field对应的Property或者Function的序号，其中Property为正，Function为负，这是一个很实用的编码技巧。'}
            ],
            methods: [
                {
                    name: 'AsProperty',
                    desc: '获取当前Field对应的Property，需要FieldIndex > 0',
                    signature: 'FORCEINLINE TSharedPtr<FPropertyDesc> AsProperty() const'
                },
                {
                    name: 'AsFunction',
                    desc: '获取当前Field对应的Function，需要FieldIndex < 0',
                    signature: 'FORCEINLINE TSharedPtr<FFunctionDesc> AsFunction() const'
                },
                {
                    name: '【静态函数】PushField',
                    desc: `因为Field对应两种量，所以还是分情况的<ul>
                        <li>Property直接执行FObjectRegistry::Push即可</li>
                        <li>Function首先也得和Property一样执行Object的Push<ul>
                            <li>还需要生成一个闭包，捕获这个Object</li>
                            <li>这个闭包需要根据这个函数是否为LatentAction，调用不同的Cpp函数，Class_CallLatentFunction会让Lua侧的coroutine挂起。</li>
                        </ul></li>
                    </ul>`,
                    signature: 'static void PushField(lua_State *L, TSharedPtr<FFieldDesc> Field)'
                }
            ]
        },
        'FExported' : { title: 'FExported',
            variables: [
                { name: 'Enums', type: 'TArray&lt;IExportedEnum*&gt', desc: '导出的Enum，不清楚这个还是否使用，因为EKeys直接导出为了Class' },
                { name: 'Functions', type: 'TArray&lt;IExportedFunction*&gt', desc: '导出的Function，不清楚这个还是否使用，看起来没有调用' },
                { name: 'ReflectedClasses', type: 'TMap&lt;FString, IExportedClass*&gt;', desc: '导出的反射Class' },
                { name: 'NonReflectedClasses', type: 'TMap&lt;FString, IExportedClass*&gt;', desc: '导出的非反射Class' },
                { name: 'Types', type: ' TMap&lt;FString, TSharedPtr&lt;ITypeInterface&gt;&gt; Types', desc: '导出的静态Type，给容器Create的时候用的，目前就是基本类型int族/float族/FString族导出了（他们同时也导出了Class，甚至还增加了一个Value变量）' },
            ],
            methods: [
                {
                    name: 'ExportClass',
                    desc: '导出类<br>手动导出基本上都用的这个，可以直接搜索这个函数的引用，UnLua内部导出了很多种类，包含了反射U、非反射U、F、E甚至int8这种',
                    signature: 'UNLUA_API void ExportClass(IExportedClass* Class)'
                },
                {
                    name: 'ExportEnum',
                    desc: '导出枚举',
                    signature: 'UNLUA_API void ExportEnum(IExportedEnum* Enum)'
                },
                {
                    name: 'ExportFunction',
                    desc: '导出函数',
                    signature: 'UNLUA_API void ExportFunction(IExportedFunction* Function)'
                },
                {
                    name: 'AddType',
                    desc: '导出基础类型给容器Create使用',
                    signature: 'UNLUA_API void ExportClass(IExportedClass* Class)'
                }
            ]
        },
        'TExportedClassBase': { title: 'TExportedClassBase',
            methods: [
                {
                    name: '【注册元表】Register',
                    desc: `用宏定义的手动导出类元表，注意这个函数会一次性将导出的内容全部写到元表，而不是像反射访问一样，访问的时候每次都走到__index。<ul>
                        <li> 注册Class的metatable </li>
                        <li> 注册Property到metatable </li>
                        <li> 注册Func的metatable </li>
                        <li> 把metatable绑定到UE.[ClassName]上 </li>
                    </ul>`,
                    signature: 'virtual void Register(lua_State *L) override'
                }
            ]
        }
    }
};