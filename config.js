// ==================================================================
// --- CONFIGURATION FILE ---
//  在这里修改图表结构和节点内容
// ==================================================================

const CONFIG = {
    // --- UI 显示文本配置 ---
    uiStrings: {
        mainTitle: "GAS 核心类型交互图",
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

    // --- 保持您的Mermaid代码原封不动 ---
    diagramDefinition: `
        graph TD
        subgraph GameplayAbility
            GA_Tutorial[相关范式]

            GA_UGameplayAbility[UGameplayAbility<br>技能本身]
            GA_UGameplayAbility                 -.->        |Array| GA_UGameplayAbility_Array
            GA_UGameplayAbility                 -->         |CDO<br>以脑海中的技能存在于| GA_FGameplayAbilitySpec

            GA_UGameplayAbility_Array[UGameplayAbility<br>Array]
            GA_UGameplayAbility_Array@{ shape: processes }
            GA_UGameplayAbility_Array           -->         |ReplicatedInstances/NonReplicatedInstances<br>InstancingPolicy相关<br>以释放出的技能存在于| GA_FGameplayAbilitySpec

            GA_FGameplayAbilitySpec[FGameplayAbilitySpec<br>相当于学会的技能]
            GA_FGameplayAbilitySpec             -->         |构造函数调用GenerateNewHandle| GA_FGameplayAbilitySpecHandle
            GA_FGameplayAbilitySpec             -.->        |Array| GA_FGameplayAbilitySpec_Array

            GA_FGameplayAbilitySpec_Array[FGameplayAbilitySpec<br>Array]
            GA_FGameplayAbilitySpec_Array@{ shape: processes }
            GA_FGameplayAbilitySpec_Array       -->         |GiveAbility/ClearAbility相关| GA_FGameplayAbilitySpecContainer
            
            GA_FGameplayAbilitySpecHandle[FGameplayAbilitySpecHandle<br>static自增Id全局唯一<br>经常用来作为索引]

            GA_FGameplayAbilitySpecContainer[FGameplayAbilitySpecContainer]

            GA_FGameplayAbilitySpecDef[FGameplayAbilitySpecDef]
            GA_FGameplayAbilitySpecDef          --->         |带上GEHandle可以生成| GA_FGameplayAbilitySpec
            GA_FGameplayAbilitySpecDef          -.->         |带上GEHandle可以生成| GA_FGameplayAbilitySpecDef_Array

            GA_FGameplayAbilitySpecDef_Array[FGameplayAbilitySpecDef<br>Array]
            GA_FGameplayAbilitySpecDef_Array@{ shape: processes }

            GA_FGameplayEventData[FGameplayEventData<br>通常也被系统称为Payload<br>被项目魔改了<br>魔改ASC:不需要Event驱动]

            GA_FGameplayAbilityTargetData[FGameplayAbilityTargetData<br>继承之后可以自定义的数据集合]
            GA_FGameplayAbilityTargetData       -.->        |Array| GA_FGameplayAbilityTargetData_Array

            GA_FGameplayAbilityTargetData_Array[FGameplayAbilityTargetData<br>Array]
            GA_FGameplayAbilityTargetData_Array@{ shape: processes }
            GA_FGameplayAbilityTargetData_Array -->         |被包裹| GA_FGameplayAbilityTargetDataHandle

            GA_FGameplayAbilityTargetDataHandle[FGameplayAbilityTargetDataHandle]
            GA_FGameplayAbilityTargetDataHandle -->         |装填进入| GA_FGameplayEventData
        end
        GA_FGameplayAbilitySpecContainer        -->         |ActivatableAbilities<br>Owner激活的GA<br>以学会的技能存在于| ASC_UAbilitySystemComponent
        GA_FGameplayAbilitySpecHandle           -.->        |GameplayEventTriggeredAbilities<br>存储什么GT可以触发什么GA<br>GA AbilityTriggers相关<br>以Map的Key存在于| ASC_UAbilitySystemComponent
        GA_FGameplayEventData                   -.-         |原生的GAS,两者通过GA<br>SendGameplayEvent交互<br>魔改后直接EventData作为Activate参数| ASC_UAbilitySystemComponent
        GA_FGameplayAbilitySpecDef_Array        -->         |作为GrantedAbilitySpecs存在于<br>说明了GE可以GiveGA| GE_FGameplayEffectSpec

        subgraph GameplayEffect
            GE_Tutorial[相关范式]

            GE_UGameplayEffect[UGameplayEffect<br>技能修改数据模板]
            GE_UGameplayEffect                  -->         |作为Def存在于| GE_FGameplayEffectSpec

            GE_FGameplayEffectContext[FGameplayEffectContext<br>从GA提取，存储一部分上下文数据]
            GE_FGameplayEffectContext           -->         |被包裹<br>SharedPtr| GE_FGameplayEffectContextHandle

            GE_FGameplayEffectContextHandle[FGameplayEffectContextHandle<br>这个和GASpecHandle/ActiveGEHandle又不一样<br>这玩意是一层SharedPtr包装]
            GE_FGameplayEffectContextHandle     --->        |作为EffectContext存在于| GE_FGameplayEffectSpec

            GE_FActiveGameplayEffect[FActiveGameplayEffect]
            GE_FActiveGameplayEffect            -->         |Array| GE_FActiveGameplayEffect_Array

            GE_FActiveGameplayEffect_Array[FActiveGameplayEffect<br>Array]
            GE_FActiveGameplayEffect_Array@{ shape: processes }
            GE_FActiveGameplayEffect_Array      -->         |被包裹| GE_FActiveGameplayEffectsContainer

            GE_FGameplayEffectSpec[FGameplayEffectSpec<br>技能修改数据包]
            GE_FGameplayEffectSpec              -->         |被包裹| GE_FActiveGameplayEffect
            GE_FGameplayEffectSpec              -->         GE_FAGEH_FAGE_MP

            GE_FAGEH_FAGE_MP( )
            style GE_FAGEH_FAGE_MP stroke-width:0,fill:transparent
            GE_FAGEH_FAGE_MP                    -->         |一组存在于| GE_FActiveGameplayEffect

            GE_FActiveGameplayEffectHandle[FActiveGameplayEffectHandle]
            GE_FActiveGameplayEffectHandle      -->         |这个和GA不一样，是手动生成的，而不是Spec构造时<br>通常使用场景为ApplyGameplayEffectSpec| GE_FAGEH_FAGE_MP

            GE_FGameplayEffectModifierMagnitude[FGameplayEffectModifierMagnitude<br>Modifier的计算类]
            GE_FGameplayEffectModifierMagnitude -->         |其中一种应用<br>SetSetByCallerMagnitude| GE_FGameplayEffectSpec

            GE_FActiveGameplayEffectsContainer[FActiveGameplayEffectsContainer]
        end
        GE_FActiveGameplayEffectsContainer      -->         |ActiveGameplayEffects<br>存储当前运行中的DurationGE| ASC_UAbilitySystemComponent

        subgraph GameplayTags
            GT_FGameplayTagContainer[FGameplayTagContainer]
        end

        subgraph AttributeSet
            AS_UAttributeSet[UAttributeSet]
            AS_FScalableFloat[FScalableFloat]
        end

        subgraph AbilitySystemComponent
            ASC_UAbilitySystemComponent[UAbilitySystemComponent]
        end

        subgraph Ability/GameplayTask
            GTask_UGameplayTask[UGameplayTask<br>任务基类]
            GTask_UGameplayTask                 -.->        |Array| GTask_UGameplayTask_Array

            GTask_UGameplayTask_Array[UGameplayTask<br>Array]
            GTask_UGameplayTask_Array@{ shape: processes }
        end
        GTask_UGameplayTask_Array               -->         |ActiveTasks<br>通过ASC<br>以执行中的任务存在于| GA_UGameplayAbility
    `,

    // --- 在这里配置每个节点的详细信息 ---
    nodeDetails: {
        'GA_UGameplayAbility': {
            title: 'UGameplayAbility (技能模板)',
            // --- 新的分类结构演示 ---
            variables: [
                {
                    category: '【核心】身份与关系标签',
                    items: [
                        { name: 'AbilityTags', type: 'FGameplayTagContainer', desc: '【自己身份证】可以相当于当前GA的身份证，GA之间的交互就是在各自的身份证之间完成的，可以被Block，被Cancel，简单点可以想象成狼人杀' },
                        { name: 'CancelAbilitiesWithTag', type: 'FGameplayTagContainer', desc: '【眩晕，打断别的GA】如果当前有生效中GA的身份证里面，和我存在任何一条相同(HasAny)，就被打断' },
                        { name: 'BlockAbilitiesWithTag', type: 'FGameplayTagContainer', desc: '【沉默，阻挡别的GA】给头头(ASC)说，现在我们的系统不准这些身份的人进来了！存放到ASC的BlockedAbilityTags，直到自己GA End' },
                        { name: 'ActivationOwnedTags', type: 'FGameplayTagContainer', desc: '【拉帮结派，数据产生者】和头头(ASC)说，我来了，我还要多带几个人来！通常用作GA触发之后，设置一些GA相关的状态，例如Ability.Block，这里就可以拉小弟State.Blocking。Tips:可以驱动动画的Transition' },
                    ]
                },
                {
                    category: '【核心】激活前置条件',
                    items: [
                        { name: 'ActivationRequiredTags', type: 'FGameplayTagContainer', desc: '【前置条件】问头头(ASC)说，我要的人都来了么？没有都来的话(HasAll)，那我也不来了！' },
                        { name: 'ActivationBlockedTags', type: 'FGameplayTagContainer', desc: '【前置条件】问头头(ASC)说，我不想见的人来了么？如果来了其中任何一个人的话(HasAny)，那我也不来了！' },
                        { name: '(Source/Target)(Required/Blocked)Tags', type: 'FGameplayTagContainer', desc: '【前置条件】这四个和上面类似，只是判断的对象不一样。'},
                        { name: 'AbilityTriggers', type: 'TArray&lt;FAbilityTriggerData&gt;', desc: '【等待戈多，数据消耗者】头头(ASC)把GA加入名单(OnGiveAbility)的时候，就会统计他的诉求，等我要的人来了，再叫我！Tips:可以消耗AnimNotify生产的Tag'},
                    ]
                },
                {
                    category: '【策略配置】',
                    items: [
                        { name: 'InstancingPolicy', type: 'EGameplayAbilityInstancing::Type', desc: '【实例化策略】决定当前的技能能否在Spec里面存在实例，以及实例化的时机，如果选择不需要实例化，那么永远都是使用的CDO。还可以选择PerActor和PerExecution实例化策略，如果GA内部存在需要记录的数据，并且每个Instance不一样，那么就需要考虑这个策略。' },
                        { name: 'ReplicationPolicy', type: 'EGameplayAbilityReplicationPolicy::Type', desc: '【同步策略】决定技能的执行和效果如何在网络中同步。' },
                        { name: 'NetExecutionPolicy', type: 'EGameplayAbilityNetExecutionPolicy::Type', desc: '【执行策略】根据策略看本地跑还是服务器跑、本地'}
                    ]
                },
                {
                    category: '【Task相关】',
                    items: [
                        { name: 'ActiveTasks', type: 'TArray&lt;UGameplayTask*&gt;', desc: '激活的任务集合'}
                    ]
                },
                {
                    category: '【锁相关】',
                    items: [
                        { name: 'ScopeLockCount', type: 'int8', desc: '专门服务于函数ApplyGameplayEffectSpecToTarget，设计上是防止在迭代的时候，修改ASC里面的数据，这里对GA和ASC都会加上锁'},
                        { name: 'WaitingToExecute', type: 'TArray&lt;FPostLockDelegate&gt;', desc: '在上锁的时候，缓存执行的Delegate，后续再执行'}
                    ]
                },
                {
                    category: '【不常用】资源关联GE',
                    items: [
                         { name: 'CooldownGameplayEffectClass', type: 'TSubclassOf&lt;UGameplayEffect&gt;', desc: '【感觉没人用啊】技能冷却所使用的GE模板。' },
                         { name: 'CostGameplayEffectClass', type: 'TSubclassOf&lt;UGameplayEffect&gt;', desc: '【感觉没人用啊】技能消耗所使用的GE模板。' }
                    ]
                },
            ],
            methods: [ // 方法部分仍使用平铺结构作为对比
                {
                    name: '(K2_)CanActivateAbility',
                    desc: '检查技能当前是否可被激活，蓝图(K2_)在Native函数最后被调用',
                    signature: 'virtual bool CanActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayTagContainer* SourceTags = nullptr, const FGameplayTagContainer* TargetTags = nullptr, OUT FGameplayTagContainer* OptionalRelevantTags = nullptr) const'
                },
                {
                    name: 'CallActivateAbility',
                    desc: '很简单的函数，里面执行PreActive和ActivateAbility',
                    signature: 'void CallActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, FOnGameplayAbilityEnded::FDelegate* OnGameplayAbilityEndedDelegate = nullptr, const FGameplayEventData* TriggerEventData = nullptr);'
                },
                {
                    name: 'PreActivate',
                    desc: '设置一些执行逻辑前的状态',
                    signature: 'virtual void PreActivate(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, FOnGameplayAbilityEnded::FDelegate* OnGameplayAbilityEndedDelegate);'
                },
                {
                    name: '(K2_)ActivateAbility(FromEvent)',
                    desc: '执行当前GA的激活逻辑',
                    signature: 'virtual void ActivateAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, const FGameplayEventData* TriggerEventData);'
                },
                {
                    name: '(K2_)CancelAbility',
                    desc: '打断Ability并且通过ASC给客户端发RPC',
                    signature: 'virtual void CancelAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, bool bReplicateCancelAbility);'
                },
                {
                    name: '(K2_)EndAbility',
                    desc: '结束当前的Ability，清理相关的任务，并且通过ASC给客户端发RPC，去除ActivationOwnedTags',
                    signature: 'virtual void EndAbility(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo, bool bReplicateEndAbility, bool bWasCancelled);'
                },
                {
                    name: 'DoesAbilitySatisfyTagRequirements',
                    desc: '判断所有的前置条件(Activation/Source/Target)(Required/Blocked)Tags',
                    signature: 'virtual bool DoesAbilitySatisfyTagRequirements(const UAbilitySystemComponent& AbilitySystemComponent, const FGameplayTagContainer* SourceTags = nullptr, const FGameplayTagContainer* TargetTags = nullptr, OUT FGameplayTagContainer* OptionalRelevantTags = nullptr) const;'
                },
                {
                    name: 'GetAbilityLevel',
                    desc: '获取ASC学会技能的Level',
                    signature: `int32 GetAbilityLevel() const;`
                },
                {
                    name: 'GetAbilityLevel',
                    desc: '获取ASC学会技能或者非实例化(CDO)GA的Level',
                    signature: `int32 GetAbilityLevel(FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo) const;`
                },
            ]
        },
        'GA_FGameplayAbilitySpec': {
            title: 'FGameplayAbilitySpec (技能实例)',
            variables: [
                { name: 'Ability', type: 'UGameplayAbility*', desc: '指向技能模板 (UGameplayAbility) 的指针。' },
                { name: 'Level', type: 'int32', desc: '该技能实例的等级。' },
                { name: 'Handle', type: 'FGameplayAbilitySpecHandle', desc: '该实例的唯一ID (FGameplayAbilitySpecHandle)。' },
                { name: 'ActiveInstances', type: 'int32', desc: '记录此技能当前激活了多少次 (用于InstancedPerExecution)。' }
            ],
            methods: [
                { name: 'IsActive', desc: '检查此技能当前是否正在激活中。', signature: 'bool IsActive() const' }
            ]
        },
        'ASC_UAbilitySystemComponent': {
            title: 'UAbilitySystemComponent (核心组件)',
            variables: [
                { name: 'ActivatableAbilities', type: 'FGameplayAbilitySpecContainer', desc: '存储所有已学会的可激活技能。' },
                { name: 'SpawnedAttributes', type: 'TArray&lt;UAttributeSet*&gt;', desc: '持有的所有属性集 (AttributeSet) 的数组。' },
                { name: 'ActiveGameplayEffects', type: 'FActiveGameplayEffectsContainer', desc: '管理所有当前生效的GE。' }
            ],
            methods: [
                {
                    name: 'TryActivateAbility',
                    desc: '尝试根据Handle激活一个技能。',
                    signature: 'bool TryActivateAbility(FGameplayAbilitySpecHandle AbilityToActivate, bool bAllowRemoteActivation = true)'
                },
                {
                    name: 'ApplyGameplayEffectToSelf',
                    desc: '对自己应用一个GE。',
                    signature: 'FActiveGameplayEffectHandle ApplyGameplayEffectToSelf(const UGameplayEffect* GameplayEffect, float Level, const FGameplayEffectContextHandle& EffectContext, const FPredictionKey& PredictionKey = FPredictionKey())'
                },
                {
                    name: 'AddLooseGameplayTag',
                    desc: '直接给组件添加一个GameplayTag。',
                    signature: 'void AddLooseGameplayTag(const FGameplayTag& Tag, int32 Count = 1)'
                },
                {
                    name: 'ApplyAbilityBlockAndCancelTags',
                    desc: '处理阻拦和打断的函数，比较通用，在GA的PreActivate和EndAbility中有使用',
                    signature: 'virtual void ApplyAbilityBlockAndCancelTags(const FGameplayTagContainer& AbilityTags, UGameplayAbility* RequestingAbility, bool bEnableBlockTags, const FGameplayTagContainer& BlockTags, bool bExecuteCancelTags, const FGameplayTagContainer& CancelTags);'
                },
                {
                    name: 'CancelAbilities',
                    desc: '处理Ability的打断，遍历所有的ActivatableAbilities，并且，如果HasAny(WithTags)并且!HasAny(WithoutTags)，两者都满足就处理打断',
                    signature: 'void CancelAbilities(const FGameplayTagContainer* WithTags=nullptr, const FGameplayTagContainer* WithoutTags=nullptr, UGameplayAbility* Ignore=nullptr);'
                },
            ]
        },
        'GA_FGameplayAbilitySpecHandle': { title: 'FGameplayAbilitySpecHandle' },
        'GA_FGameplayAbilitySpecContainer': { title: 'FGameplayAbilitySpecContainer' },
        'GT_FGameplayTagContainer': { title: 'FGameplayTagContainer' },
        'AS': { title: 'AttributeSet' },

        'GE_UGameplayEffect':
        {
            title: 'UGameplayEffect',
            variables: [
                {
                    category: '【核心】修改器相关',
                    items: [
                        { name: 'Modifiers', type: 'TArray&lt;FGameplayModifierInfo&gt;', desc: 'GE拥有的修改器' },
                        { name: 'Executions', type: 'TArray&lt;FGameplayEffectExecutionDefinition&gt', desc: 'GE拥有的计算器' },

                    ]
                },
                {
                    category: '【核心】生命周期相关',
                    items: [
                        { name: 'DurationPolicy', type: 'EGameplayEffectDurationType', desc: 'Duration的类型' },
                        { name: 'DurationMagnitude', type: 'FGameplayEffectModifierMagnitude', desc: 'Duration的计算方法，Spec会保存计算完毕的结果使用' },
                        { name: 'Period', type: 'FScalableFloat', desc: 'Period的计算方法，FScalableFloat可以适配Curve Table的计算' },
                        { name: 'bExecutePeriodicEffectOnApplication', type: 'bool', desc: '是否在最开始的时候执行一次Period的效果，例如Period(5)/Duration(10)，开这个就执行3次，不开就执行2次' },
                    ]
                }
            ],
            methods: [
                
            ]
        },
        'GE_FGameplayEffectSpec' : 
        {
            title: 'FGameplayEffectSpec',
            variables: [
                {
                    category: '【核心】GE模板相关',
                    items: [
                        { name: 'Def', type: 'const UGameplayEffect*', desc: '当前Spec拿到的GE模板' },
                    ]
                },
                {
                    category: '【GE触发GA相关】',
                    items: [
                        { name: 'GrantedAbilitySpecs', type: 'TArray&lt;FGameplayAbilitySpecDef&gt;', desc: '当前GE可以触发的GA' },
                    ]
                },
                {
                    category: '【InputContext相关】',
                    items: [
                        { name: 'SetByCallerNameMagnitudes', type: 'TMap&lt;FName, float&gt;', desc: '【Input】GE很多Magnitude可以设置SetByCaller类型，会从这数组里面取值，这个值不会传递' },
                        { name: 'SetByCallerTagMagnitudes', type: 'TMap&lt;FGameplayTag, float&gt;', desc: '【InOut】GE很多Magnitude可以设置SetByCaller类型，会从这数组里面取值，触发GA时，可传递给GA，当GA又触发GE的时候这个值会传递' },
                    ]
                }
            ],
            methods: [
                {
                    name: 'AttemptCalculateDurationFromDef',
                    desc: '通过Def计算当前Spec的Duration',
                    signature: 'bool AttemptCalculateDurationFromDef(OUT float& OutDefDuration) const;'
                },
                {
                    name: 'SetSetByCallerMagnitude',
                    desc: '设置SetByCaller的值，用Name当做Key',
                    signature: 'void SetSetByCallerMagnitude(FName DataName, float Magnitude);'
                },
                {
                    name: 'SetSetByCallerMagnitude',
                    desc: '设置SetByCaller的值，用Tag当做Key',
                    signature: 'void SetSetByCallerMagnitude(FGameplayTag DataTag, float Magnitude);'
                },
            ]
        },
        'GE_FGameplayEffectModifierMagnitude' :
        {
            title: 'FGameplayEffectModifierMagnitude',
            variables: [
                { name: 'MagnitudeCalculationType', type: 'EGameplayEffectMagnitudeCalculation', desc: '当前Magnitude类型四种类型，ScalableFloat/AttributeBased/CustomCalculationClass/SetByCaller'},
                { name: 'ScalableFloatMagnitude', type: 'FScalableFloat', desc: '当前Magnitude使用浮点数计算'},
                { name: 'AttributeBasedMagnitude', type: 'FAttributeBasedFloat', desc: '当前Magnitude基于AttributeSet的捕获结果计算'},
                { name: 'CustomMagnitude', type: 'FCustomCalculationBasedFloat', desc: '当前Magnitude直接使用CalculationClass进行计算'},
                { name: 'SetByCallerMagnitude', type: 'FSetByCallerFloat', desc: '当前Magnitude使用GESpec构造时SetByCaller的预设结果，具体用法可以参考Test_SetByCallerStackingDuration'},
            ]
        },


        'GA_Tutorial' :
        {
            title: 'GA相关范式',
            methods: [
                {
                    name: 'GA的生命周期',
                    desc: 'GA有两个方面的作用，视作一个技能模板(AbilityTags/AbilityTriggers/Policy等配置)，或一个技能实例(ActiveTask等运行时)。<br>对于ASC来说，学会的技能(FGameplayAbilitySpec)生命周期在GiveAbility和ClearAbility之间。<br>对于一个GA实例来说，其生命周期在ActivateAbility和EndAbility之间。<b>核心：GA的“剧本”是可以持续很长时间的，并非瞬间完成。</b>'
                },
                {
                    name: 'GA -> GE',
                    desc: 'GA通过创建`GameplayEffectSpec`来配置GE。这个Spec是一个中间数据结构，它打包了GE模板、等级、`EffectContext`（法证报告：谁，用什么，对谁）、以及最重要的`SetByCaller`动态数值。<b>GA是`EffectContext`的主要创建者和填充者。</b>'
                },
                {
                    name: 'GA -> GA',
                    desc: '通过`SendGameplayEventToActor`触发其他GA是GAS事件驱动设计的核心。一个GA可以作为事件的“生产者”，而其他配置了`AbilityTriggers`的GA可以作为“消费者”。这使得技能系统可以高度解耦，例如“武器命中事件”可以同时触发“吸血”、“溅射”、“施加Debuff”等多个独立的GA。'
                },
                {
                    name: 'GA的核心武器：AbilityTask (技能任务)',
                    desc: '<b>这是GA能够执行长时程、异步逻辑的根本。</b>Task就像是GA剧本中的一个个“待办事项”。GA可以启动一个Task，然后将执行权交还给游戏主循环，当Task完成时（比如延迟结束、收到网络事件），它会通过委托(Delegate)回调GA，让GA继续执行下一步逻辑。<br><b>常见Task:</b><br>- <b>WaitDelay</b>: 等待一段时间。<br>- <b>WaitTargetData</b>: 等待玩家提供目标数据。<br>- <b>WaitGameplayEvent</b>: 等待一个外部GameplayEvent。<br>- <b>PlayMontageAndWait</b>: 播放一个动画蒙太奇并等待其结束。<br>- <b>WaitAttributeChange</b>: 监视一个属性的变化。'
                },
                {
                    name: 'GA与世界的交互：动画与移动',
                    desc: 'GA并非只在数据层面工作，它通过特定的Task与游戏世界紧密相连。<br>- <b>动画</b>: 使用`AbilityTask_PlayMontageAndWait`可以精确控制角色播放哪个动画，并在动画的特定时间点（通过AnimNotify和GameplayEvent）继续执行技能逻辑。<br>- <b>移动</b>: 使用`AbilityTask_ApplyRootMotion...`系列Task，GA可以驱动角色的`Root Motion`，实现冲锋、跳跃等复杂的位移技能。'
                },
                {
                    name: 'GA的网络魔法：客户端预测 (Prediction)',
                    desc: '为了让操作感觉流畅，GA支持客户端预测。当客户端激活一个技能时，会生成一个<code>PredictionKey</code>。它会立即在本地（预测性地）执行技能逻辑，同时将`PredictionKey`和激活请求一起通过RPC发给服务器。服务器权威执行后，会将结果同步给客户端。客户端根据`PredictionKey`匹配上之前的预测，并根据服务器结果进行校正。<b>这是GAS网络体验优秀的核心。</b>'
                },
                {
                    name: 'GA的代价：Cost & Cooldown (消耗与冷却)【这个通常不太使用】',
                    desc: 'GA自身不直接处理消耗和冷却的数值逻辑，而是通过应用GE来实现。这是一个标准范式：<br>1. <b>检查代价 (CheckCost)</b>: 在激活前，检查`CostGameplayEffect`中的属性修改是否会导致资源为负。<br>2. <b>提交代价 (CommitAbility)</b>: 技能确定要执行后，调用此函数。它会应用`CostGameplayEffect`来真正地扣除资源（如法力值）。<br>3. <b>应用冷却 (ApplyCooldown)</b>: 提交代价后，GA会应用`CooldownGameplayEffect`。这个GE通常是持续性的，它会给ASC添加一个代表“冷却中”的Tag，并在持续时间结束后自动移除该Tag。'
                }
            ]
        },
        'GE_Tutorial' :
        {
            title: 'GE相关范式',
            methods: [
                {
                    name: 'GE的“身份”：类型与周期 (Duration)',
                    desc: 'GE有三种基本类型，决定了它的生命周期：<br>- <b>Instant (即时)</b>: 应用后立即执行，然后就消失。用于造成单次伤害、瞬间治疗。<br>- <b>Duration (持续)</b>: 应用后会持续一段时间，到期后自动移除。用于DOT、BUFF、DEBUFF。<br>- <b>Infinite (无限)</b>: 应用后会永久存在，除非被手动移除。用于永久性光环、装备提供的属性加成。'
                },
                {
                    name: 'GE的核心工作：修改属性与标签',
                    desc: 'GE主要通过以下方式影响目标：<br>- <b>Attribute Modifiers</b>: 这是GE最核心的功能。定义了要修改哪个属性（如Health）、操作方式（加、减、乘、覆盖）、以及数值。<br>- <b>Granted Tags</b>: 当GE生效时，可以给目标添加一个或多个GameplayTag。这是实现状态（如眩晕、燃烧、冰冻）的基础。<br>- <b>Granted Abilities</b>: 强大的功能。当GE生效时，可以临时或永久地赋予目标新的技能。例如，一个“恶魔变身”的BUFF GE可以赋予玩家新的恶魔技能。'
                },
                {
                    name: 'GE的“计算逻辑”：Modifier vs Execution',
                    desc: 'GE的数值计算主要有两种方式：<br>- <b>Attribute Based (基于属性)</b>: 直接使用Modifier。数值可以是一个固定值，也可以引用某个属性值（例如伤害值等于“攻击力”属性的50%）。简单直接，配置驱动。<br>- <b>Custom Execution Calculation (自定义计算)</b>: 使用`GameplayEffectExecutionCalculation` C++类。这允许你编写任意复杂的计算逻辑，可以捕获源和目标的多个属性，进行复杂的公式计算（如考虑护甲、抗性、暴击、等级差异等），最后输出最终的属性修改量。<b>所有复杂的伤害计算都应使用Execution。</b>'
                },
                {
                    name: 'GE的“应用条件与免疫”',
                    desc: 'GE并非总能成功应用。通过`Application Tag Requirements`可以设置应用的前置条件：<br>- <b>Ongoing Tag Requirements</b>: 目标必须拥有这些Tag，GE才能应用。<br>- <b>Ignore Tag Requirements</b>: 如果目标拥有这些Tag，GE将无法应用。<b>这就是实现“火焰免疫”（拥有`State.Immunity.Fire`标签）等逻辑的地方。</b>'
                },
                {
                    name: 'GE的“堆叠规则” (Stacking)',
                    desc: '当一个目标已经有了一个GE，再次对他应用同一个GE时会发生什么？由堆叠规则决定。<br>- <b>Aggregate by Source/Target</b>: 每个施法者/所有施法者共享一个GE实例，刷新持续时间或增加层数。<br>- <b>Stack Limit</b>: 可以设置最大堆叠层数。层数可以影响Modifier的最终数值。例如，每层“中毒”GE使伤害增加10%。'
                },
                {
                    name: 'GE的“表现层”：GameplayCue',
                    desc: 'GE本身只负责数据和逻辑，不负责视觉表现。<b>GameplayCue是连接GE和特效/音效的桥梁。</b>GE可以设置在“被应用时”、“执行时”、“被移除时”触发哪个GameplayCue（通过GameplayTag匹配）。GameplayCue是一个独立的蓝图或Actor，负责播放粒子特效、声音、屏幕震动等。<b>这使得数据逻辑和视觉表现完美解耦。</b>'
                },
                {
                    name: 'GE的“法证报告”：EffectContext',
                    desc: '每个被应用的GE都携带一个`EffectContext`。这个“报告”记录了效果的完整因果链：谁发起的、由哪个技能、用什么东西造成的。这对于后续的逻辑判断（如伤害来源反弹、击杀归属）和调试至关重要。'
                }
            ]
        }
    }
};