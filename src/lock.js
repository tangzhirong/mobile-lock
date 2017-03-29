(function(){
	 /**
	 * 移动端手势密码组件
	 * @date     2017-03-29
	 * @author   yun<tangzhirongbupt@163.com>
	 * @github   https://github.com/tangzhirong
	 * @blog     home.cnblogs.com/u/tangzhirong/
	 */


	//定义组件状态
	const inputPsw = 1,  // 第一次输入密码
		  inputPswAgain = 2,  //再次输入密码
		  setPswOk = 3,  //密码设置成功
		  checkPsw = 4,  //开始验证密码
		  checkPswOk = 5;  //密码验证正确

	//定义组件提示信息
	const defaultMessage = {
		pswShort:"密码太短，至少需要5个点",
		pswAgain:"请再次输入手势密码",
		pswSetOk:"密码设置成功",
		pswNotSame:"两次输入不一致",
		pswHasSet:"密码已设置，请验证",
		pswOk:"密码正确",
		pswWrong:"输入的密码不正确"
	}

	//手势密码组件构造函数
	function lock(opt){
		this.size = opt.size || 300;  //手势区大小
		this.title = opt.title || "手势密码";  //标题
		this.panelSize = opt.panelSize || 3;  //手势区单边圆点数
		this.state = inputPsw;  //初始状态：第一次输入密码
		this.firstPsw = [];   //第一次输入的密码
	}

	//组件初始化
	lock.prototype.init = function(){
		this.setParams();   //设置初始化参数
		this.drawPanel();   //创建手势面板
	}

	//渲染DOM基础结构
	lock.prototype.renderDom = function(){
		//根据设备screen宽度设置canvas宽度
		var canvasWidth = this.getCanvasWidth(this.size);
		var lock_wrap = document.createElement('div');
		var str = '<h4 class="lock_title">'+this.title+'</h4>'+
		'<canvas class="lock_panel" width="'+canvasWidth+'" height="'+canvasWidth+'"></canvas>'+
		'<div class="lock_warn">请输入手势密码</div>'+
		'<div class="lock_choose"><input type="radio" checked="checked" name="psw_type" value="set_psw" />设置密码</br></br><input type="radio" name="psw_type" value="check_psw" />验证密码</div>';
		lock_wrap.innerHTML = str;
		document.body.appendChild(lock_wrap);
	}

	//设置初始化参数
	lock.prototype.setParams = function(){
		//保存所有圆圈	
		this.circleArr = [];
		//保存设置密码的圆圈路径
		this.psw_route = [];
		//保存未触摸的圆圈
		this.leftCircle = [];
		//控制触摸事件触发
		this.touchFlag = false;
		//获取并设置canvas对象
		this.lock_panel = document.getElementsByClassName('lock_panel')[0];
		this.crc2D = this.lock_panel.getContext("2d");	
	}

	//创建手势面板
	lock.prototype.drawPanel = function(){
		var count = 0;
		this.circleRadius = this.crc2D.canvas.width / (2 + 4 * this.panelSize);
		var r = this.circleRadius;
		this.crc2D.clearRect(0, 0, this.crc2D.canvas.width, this.crc2D.canvas.height);

		//根据canvas大小分配圆圈大小
		for (var i = 0 ; i < this.panelSize ; i++) {
            for (var j = 0 ; j < this.panelSize ; j++) {
                count++;
                //圆圈对象
                var circle = {
                    x: j * 4 * r + 3 * r,  
                    y: i * 4 * r + 3 * r,
                    index: count   //序号
                };
                this.drawCircle(circle.x, circle.y);    //根据位置画圆
                this.circleArr.push(circle);  //保存到所有圆圈数组
                this.leftCircle.push(circle);  //保存到未触摸圆圈数组
            }
        }
	}

	//画圆
	lock.prototype.drawCircle = function(x,y){
        this.crc2D.lineWidth = 2;
        this.crc2D.beginPath();
        this.crc2D.arc(x, y, this.circleRadius, 0, Math.PI * 2, true);
        this.crc2D.fillStyle="white";  //白色填充色
		this.crc2D.fill();
		this.crc2D.strokeStyle = 'gray';  //灰色边框
        this.crc2D.stroke();
        this.crc2D.closePath();
	}

	

	//画点
	lock.prototype.drawPoint = function(x,y){
        this.crc2D.beginPath();
        this.crc2D.arc(x, y, this.circleRadius, 0, Math.PI * 2, true);
        this.crc2D.fillStyle="rgb(255,167,35)";
		this.crc2D.fill();
		this.crc2D.strokeStyle = 'gray';
        this.crc2D.stroke();
        this.crc2D.closePath();
	}

	//画线
	lock.prototype.drawLine = function(previous,pos){
		this.crc2D.beginPath();
        this.crc2D.lineWidth = 2;
        this.crc2D.moveTo(this.psw_route[previous].x, this.psw_route[previous].y);  
        this.crc2D.lineTo(pos.x, pos.y);
        this.crc2D.strokeStyle = 'red';
        this.crc2D.stroke();
        this.crc2D.closePath();
	}


	//滑动时更新组件
	lock.prototype.moveUpdate = function(pos){
		for (var i = 0 ; i < this.leftCircle.length ; i++) {
            if (Math.abs(pos.x - this.leftCircle[i].x) < this.circleRadius && Math.abs(pos.y - this.leftCircle[i].y) < this.circleRadius) {
                this.drawPoint(this.leftCircle[i].x, this.leftCircle[i].y);
                this.psw_route.push(this.leftCircle[i]);
                this.drawLine(this.psw_route.length-2,this.leftCircle[i]);
                this.leftCircle.splice(i, 1);
                break;
            }
        }
	}

	//停止触摸时更新组件
	lock.prototype.endUpdate = function(psw){
		//获取提示栏
		var lock_warn = document.getElementsByClassName('lock_warn')[0];
		if(this.state == inputPsw){
			if(psw.length<5){
				lock_warn.innerHTML = defaultMessage.pswShort;
			}else{
				//保存第一次正确输入的密码
				this.firstPsw = this.psw_route;
				lock_warn.innerHTML = defaultMessage.pswAgain;
				this.state = inputPswAgain;
				
			}
		}else if(this.state == inputPswAgain){
			console.log(this.psw_route);
			if(this.checkPsw(this.psw_route,this.firstPsw)){
				lock_warn.innerHTML = defaultMessage.pswSetOk;
				this.state = setPswOk;
				window.localStorage.setItem('password', JSON.stringify(this.psw_route));
			}else{
				lock_warn.innerHTML = defaultMessage.pswNotSame;
			}
		}else if(this.state == setPswOk){
			lock_warn.innerHTML = defaultMessage.pswHasSet;
		}else if(this.state == checkPsw){
			//读取localStorage中保存的密码
			var pswStore = JSON.parse(window.localStorage.getItem("password"));
			if(this.checkPsw(this.psw_route,pswStore)){
				lock_warn.innerHTML = defaultMessage.pswOk;
				this.state = checkPswOk;
			}else{
				lock_warn.innerHTML = defaultMessage.pswWrong;
			}
		}
		//组件重置
		this.reset();
	}

	
	//组件重置
	lock.prototype.reset = function(){
		var self = this;
		setTimeout(function(){
			self.crc2D.clearRect(0, 0, self.crc2D.canvas.width, self.crc2D.canvas.height);
			//重新绘制lock panel
			self.init();
		},1000)
	}

	

	//绑定事件
	lock.prototype.bindEvent = function(){
		var self = this;
		//开始触摸
		this.lock_panel.addEventListener("touchstart",function(e){
			e.preventDefault();  
			//获取触摸位置 
			var pos = self.getPosition(e);   
			//判断触摸的是哪个圆圈
			for (var i = 0 ; i < self.circleArr.length ; i++) {
                if (Math.abs(pos.x - self.circleArr[i].x) < self.circleRadius && Math.abs(pos.y - self.circleArr[i].y) < self.circleRadius) {
                	//标识开始滑动
                    self.touchFlag = true;   
                    //触摸时画点
                    self.drawPoint(self.circleArr[i].x,self.circleArr[i].y);
                    //将该点添加到密码存储路径psw_route中
                    self.psw_route.push(self.circleArr[i]);
                    //更新未触摸圆圈数组
                    self.leftCircle.splice(i,1);
                    break;
                }
            }

		},false);

		//触摸滑动
		this.lock_panel.addEventListener("touchmove", function (e) {
                if (self.touchFlag) {
                	//滑动时触发组件更新
                    self.moveUpdate(self.getPosition(e));
                }
             }, false);

		//触摸结束
		this.lock_panel.addEventListener("touchend", function (e) {
		     if (self.touchFlag) {
		     	//标识停止触摸
		         self.touchFlag = false;
		         //停止时触发组件更新
		         self.endUpdate(self.psw_route);
		     }

		}, false);

		//设置密码与验证密码
		var radios = document.getElementsByTagName('input');
		//设置密码
		radios[0].addEventListener("click",function(e){
			self.state = inputPsw;
			self.firstPsw = [];
			self.init();
		},false);
		//验证密码
		radios[1].addEventListener("click",function(e){
			document.getElementsByClassName('lock_warn')[0].innerHTML = "请输入手势密码";
			self.crc2D.clearRect(0, 0, self.crc2D.canvas.width, self.crc2D.canvas.height);
			//重新绘制lock panel
			self.init();
			self.state = checkPsw;

		},false);

	}

	//获取touch位置相对于canvas的坐标
	lock.prototype.getPosition = function(e){
		var rect = e.currentTarget.getBoundingClientRect();
            var pos = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        return pos;
	}

	//根据设备screen宽度设置canvas宽度
	lock.prototype.getCanvasWidth = function(size){
		if(size>320&&size<=375){
			return 260;
		}else if(size>375&&size<=414){
			return 300;
		}else if(size>414&&size<=639){
			return 360;
		}else if(size>=640){
			return 460;
		}else{
			return 300;
		}
	}
	//检验两次输入密码是否一致
	lock.prototype.checkPsw = function(psw1,psw2){
		var p1 = '',
			p2 = '';
		for (var i = 0 ; i < psw1.length ; i++) {
            p1 += psw1[i].index;
        }
        for (var i = 0 ; i < psw2.length ; i++) {
            p2 += psw2[i].index;
        }
        return p1 === p2;
	}

	window.lock = lock;

})(); 