////////////////////////////////////////////////////////////////////////cnpm install redis -p
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////screen -S node
////////////////////////////////////////////////////////////////////////node +*.js
//////////////////////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////ps -ef | grep node
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////  v1  直接读取源txt数据
////////////////////////////////////////////////////////////////////////  v2  //加一个返回病害，当前文件的目录的接口功能
////////////////////////////////////////////////////////////////////////  v3  //直接读取live1hr_cnweather_neimeng数据， 内蒙古自治区
////////////////////////////////////////////////////////////////////////  v4  //直接读取bip数据， 提供预报。根据后缀选中最新文件。
////////////////////////////////////////////////////////////////////////      
////////////////////////////////////////////////////////////////////////
///var_async=require('async'),通过async很好的控制异步的执行流程.async是国外异步模块，它的功能与 阿里eventproxy相似
///Generator特性替代回调函数
///Promise模式：如果要确保每个方法都顺序执行，每个方法都是。模块化的node里,前端模块化加速的今天，Promise编程思想必定会渗透至前端的更多角落
var Promise = require("bluebird");
///////////////////////////////
const http = require('http'), url = require("url");
///////////////////////////////
const redis = require("redis");
const rf = require("fs");  
const iconv = require('iconv-lite');
///////////////////////////////
const BinaryFile = require('binary-file');
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////   
function getClientIp(cReq) {
		//360safe通过bajie代理直接访问baidu.com
		 ////console.log("1 "+cReq.headers['x-forwarded-for'])			/// undefine
		 ////console.log("2 "+cReq.connection.remoteAddress)			/// 210.12.48.242
		 ////console.log("3 "+cReq.socket.remoteAddress)				/// 210.12.48.242
		 ////console.log("44 "+cReq.headers['x-real-ip'])				/// undefine
		////console.log("5 "+cReq.connection.socket.remoteAddress)		/// 不存在，报错
		
        return cReq.headers['x-forwarded-for'] ||
        cReq.connection.remoteAddress ||
        cReq.socket.remoteAddress ||
        cReq.connection.socket.remoteAddress;
    };
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////  
function isInteger(obj){  return obj%1 === 0 } 
//////////////////////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////////////////////// 
	readDir = Promise.promisify(rf.readdir);   //Reads the contents of a directory
	//////////////////////////////////
	function file_folder_info(name1, mtime1){
		this.name = name1;
		this.mtime= mtime1;
	}
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////    
function Fetch_the_newest_file_ta2m(newest_folder, str_postfix) {
    return new Promise(function(resolve, reject){
		var fileinfoObjs = new Array(); 
			//
			//按从小到大排序，包括根目录和子目录内的所有文件
					//var date_str = new Date("Tue Aug 01 2017 00:30:42 GMT+0800 (CST)"	);  	
					//console.log("date_str="+date_str) 	 	
					//console.log("date_sec="+date_str.getTime() );		//转换成秒	
			 ///////////////////////////////////  
			// atime， mtime ，ctime就分别代表了访问时间，修改时间以及创建时间，都为date类型				
			//
			// substring(start,end) 		方法用于提取字符串中介于两个指定下标之间的字符串。
			// substr(start [, length ]) 	方法用于返回一个从指定位置开始的指定长度的子字符串
			//   
		readDir(newest_folder)
		.then(function(files){ 
				if (files && files.length) {
					files.forEach(function (name_file) {  
						if ( rf.statSync(newest_folder+"/"+name_file).isFile() 					&& 
							 name_file.split('.')[ name_file.split('.').length-1]==str_postfix  && 
							 name_file.indexOf("ta2m") !=-1) 	{
							var stat = rf.statSync(newest_folder+"/"+name_file);  
							var mtime_str = new Date(stat.mtime).getTime() ;  
							var time_local= new Date() ; 
							if(Number(time_local-mtime_str)>=60*1000){ 	///距文件上次修改时间>1分钟,文件是完整的
								fileinfoObjs.push(new file_folder_info(newest_folder+"/"+name_file, mtime_str));
							}
							///console.log('name_file= '+"/"+name_file+" "+"mtime_str="+mtime_str+" "+Number(time_local-mtime_str) );
						}
					}); 
					fileinfoObjs.sort(function(a,b){ return -1*(a.mtime-b.mtime)});
					return resolve(fileinfoObjs[0].name) 	///返回最新的那一个文件 
				}
		}).catch(function(error) { console.log('0001发生错误！', error);})  	 ; 
    });
}    
    
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////    
function Fetch_the_newest_file(newest_folder, str_postfix) {
    return new Promise(function(resolve, reject){
		var fileinfoObjs = new Array(); 
			//
			//按从小到大排序，包括根目录和子目录内的所有文件
					//var date_str = new Date("Tue Aug 01 2017 00:30:42 GMT+0800 (CST)"	);  	
					//console.log("date_str="+date_str) 	 	
					//console.log("date_sec="+date_str.getTime() );		//转换成秒	
			 ///////////////////////////////////  
			// atime， mtime ，ctime就分别代表了访问时间，修改时间以及创建时间，都为date类型				
			//
			// substring(start,end) 		方法用于提取字符串中介于两个指定下标之间的字符串。
			// substr(start [, length ]) 	方法用于返回一个从指定位置开始的指定长度的子字符串
			//    
		readDir(newest_folder)
		.then(function(files){ 
				if (files && files.length) {
					files.forEach(function (name_file) {  
						if ( rf.statSync(newest_folder+"/"+name_file).isFile() 					&& 
							 name_file.split('.')[ name_file.split('.').length-1]==str_postfix  ) 	{
							var stat = rf.statSync(newest_folder+"/"+name_file);  
							var mtime_str = new Date(stat.mtime).getTime() ;  
							var time_local= new Date() ; 
							if(Number(time_local-mtime_str)>=60*1000){ 	///距文件上次修改时间>1分钟,文件是完整的
								fileinfoObjs.push(new file_folder_info(newest_folder+"/"+name_file, mtime_str));
							}
							/// console.log('name_file= '+"/"+name_file+" "+"mtime_str="+mtime_str+" "+Number(time_local-mtime_str) );
						}
					}); 
					fileinfoObjs.sort(function(a,b){ return -1*(a.mtime-b.mtime)});
					return resolve(fileinfoObjs[0].name) 	///返回最新的那一个文件 
				}
		}).catch(function(error) { console.log('0001发生错误！', error);})  	 ; 
    });
}    
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////    
function Fetch_the_newest_folder(dir000){
    return new Promise(function(resolve, reject){ 
		var folderinfoObjs = new Array(); 
		
		readDir(dir000)
		.then(function(folders){
				if (folders && folders.length) {
					folders.forEach(function (name_folder) {  
						if (rf.statSync(dir000+"/"+name_folder).isDirectory()) {
							var stat = rf.statSync(dir000+"/"+name_folder);  
							var mtime_str = parseInt(name_folder);  	 	///var mtime_str = new Date(stat.mtime).getTime();  			 	
							folderinfoObjs.push(new file_folder_info(dir000+"/"+name_folder, mtime_str));
							///console.log('dir000+"/"+name_folder= '+dir000+"/"+name_folder+" "+"mtime_str="+mtime_str);
						}
					}); 
					folderinfoObjs.sort(function(a,b){ return -1*(a.mtime-b.mtime)});
					return resolve(folderinfoObjs[0].name) 	///返回最新的那一个文件 
				}    
		}).catch(function(error) { console.log('0002发生错误！', error);})  	 ; 
    });
}   
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Readin_str_from_files(fileList, decode_type){
    return new Promise(function(resolve, reject){
		
		////////////////////////////////////浏览器会自带一个HTTP请求favicon.ico
		var client = redis.createClient(); 
		client.lpush("topnews", now_params.info);
		client.lpop("topnews", function (i, output) { })
		client.quit();
		
		////////////////////////////////////  读取存档数据 ; 
		console.log("    fileList.length="+fileList.length) 
		index_temp2m=-1,index_apcp24=-1,index_hmid2m=-1
        for(var i = 0, len = fileList.length; i < len; i++){ if(fileList[i].indexOf("temp2m")>=0){ 	index_temp2m=i; break; } } 
        for(var i = 0, len = fileList.length; i < len; i++){ if(fileList[i].indexOf("apcp24")>=0){ index_apcp24=i; break; } } 
        for(var i = 0, len = fileList.length; i < len; i++){ if(fileList[i].indexOf("hmid2m")>=0){ 	index_hmid2m=i; break; } } 
		///console.log("    index_temp2m="+index_temp2m)
		///console.log("    index_apcp24="+index_apcp24)
		///console.log("    index_hmid2m="+index_hmid2m)
		
		////////////////////////////////////
		var buffer1,buffer2,buffer3 = new Buffer('Hello World!');
		var text_temp = "";
		var result_str1,result_str2,result_str3 = ""
		
		var func0 = function(){
			buffer1 = Buffer.from(rf.readFileSync(fileList[index_temp2m],{encoding:'binary'}),'binary');
			buffer2 = Buffer.from(rf.readFileSync(fileList[index_apcp24],{encoding:'binary'}),'binary');
			buffer3 = Buffer.from(rf.readFileSync(fileList[index_hmid2m],{encoding:'binary'}),'binary');
		} 
		var func1  = function(){
			text_temp1 = iconv.decode(buffer1, decode_type);	//使用GBK解码
			text_temp2 = iconv.decode(buffer2, decode_type);	//使用GBK解码
			text_temp3 = iconv.decode(buffer3, decode_type);	//使用GBK解码
		}
		var func2  = function(){ 
			result_str1 = iconv.encode(text_temp1, 'utf8'); 
			result_str2 = iconv.encode(text_temp2, 'utf8'); 
			result_str3 = iconv.encode(text_temp3, 'utf8'); 
		}    
		var func3 = function(){
			return resolve([result_str1, result_str2, result_str3]) 					//////////////!!!!!!!!!!!!!!!!!!! 
		} 
		  
		Promise.resolve().then(func0).then(func1).then(func2).then(func3).catch(function(error) { console.log('111发生错误！', error);})  		;
		
    });
}	
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function json_extend(des, src, flag_keep_src_in_override){
   if(src instanceof Array){
       for(var i = 0, len = src.length; i < len; i++)
            json_extend(des, src[i], flag_keep_src_in_override);
   }
   for( var i in src){
       if(flag_keep_src_in_override) {  				/// || !(i in des) 
           des[i] = src[i];
       }
   } 
		///delete cccc["0"];  
		///delete cccc["1"];  
   return des;
} 
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
	readbinary = Promise.promisify( rf.readFile ); 
	readbuffer = Promise.promisify(Buffer.from ); 
	convert_encode_str = Promise.promisify(iconv.decode );  
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Get_json_output_from_json_obj (object_name_countyid_value_list, output_file_path){
    return new Promise(function(resolve, reject){  
	
	var yyyy_mm_dd_bjt=output_file_path.split('_live1hr_')[1].split('.json')[0]
	var hh_bjt=output_file_path.split('data0_cnweather_BJT')[1].split('_live1hr_')[0]
 
	num_value_list=[];
		for(var jjjj=0; jjjj<object_name_countyid_value_list.length; jjjj++){ 
			num_value_list.push(jjjj+"  "+ parseFloat(object_name_countyid_value_list[jjjj].value ));
		}
		////// var jsObject = JSON.parse(jsonString);   //转换为json对象
		////// alert(jsObject.bar);    					//取json中的值 
		var json_output = {status: "0" };  				///"data":   
  
		json_output.data={}
		json_output.data.outputfile = String(output_file_path)
		json_output.data.live_time_bjt = String(yyyy_mm_dd_bjt+"_"+hh_bjt+"h") 
		json_output.data.value2_min = String(Math.max.apply( Math, num_value_list ) ) 
		json_output.data.value2_max = String(Math.min.apply( Math, num_value_list ) )
		json_output.data.data = object_name_countyid_value_list 
		
		return resolve(json_output) 	
    });
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Response_str(response, json_output){
    return new Promise(function(resolve, reject){

    });
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Match_id_for_town(result_meta_str, object_name_county_value_list){
    return new Promise(function(resolve, reject){ 
	
		///console.log(object_name_county_value_list.length)
		///console.log(object_name_county_value_list[0])
		
		town_name111_list=[] ; 
		county_id111_list=[] ; 
		list_result_meta_str=result_meta_str.toString().split('\n')
			for(var jjjj=0; jjjj<list_result_meta_str.length; jjjj++){
				
				while(list_result_meta_str[jjjj].indexOf("  ") !=-1) {
					list_result_meta_str[jjjj] = list_result_meta_str[jjjj].replace('  ',' ');	
				}
				///console.log(jjjj+"---------"+list_result_meta_str[jjjj].toString().split(' ')[1].toString().split('-')[1]  ); 
				town_name111_list.push( list_result_meta_str[jjjj].toString().split(' ')[1].toString().split('-')[1] );
				county_id111_list.push( list_result_meta_str[jjjj].toString().split(' ')[0] );
			}
		////////////////////////////////////////////////////////// 
		//////////////////////////////////////////////////////////  
		town_name222_list=[] ;  
		for(var iiii=0; iiii<object_name_county_value_list.length; iiii++){  
			var json_element=object_name_county_value_list[iiii];
			///console.log(iiii+"---------"+json_element.townfullname.toString().split('-')[1]  ); 
				town_name222= json_element.townfullname.toString().split('-')[1];
				town_name222_list.push(town_name222);
			}  
		//////////////////////////////////////////////////////////  
		////////////////////////////////////////////////////////// 
		object_name_countyid_value_list=[] ; 
		for(var kkk=0; kkk<town_name111_list.length; kkk++)			 
		{
			for(var iii=0; iii<town_name222_list.length; iii++){  
				if(town_name111_list[kkk]==town_name222_list[iii]){
					var json_element=object_name_county_value_list[kkk]; 
					///console.log(town_name111_list[kkk])
					///console.log(json_element)
					json_element.county = county_id111_list[kkk];  
					object_name_countyid_value_list.push(json_element) 
					break;
				}
			} 	
		} 
			 
		////////////////////////////////////////////////////////// 
		////////////////////////////////////////////////////////// 
		return resolve(object_name_countyid_value_list) 	
    });
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Add_county_id_to_object(object_name_county_value_list, meta_jilin61){
    return new Promise(function(resolve, reject){ 
	
		////////////////////////////////////////////////////////// 
		////////////////////////////////////////////////////////// 
		Readin_str_from_file_txt(meta_jilin61, "utf8")	///读取文件内容			 
		.then(function(result_meta_str)  {  	 
						return Match_id_for_town(result_meta_str, object_name_county_value_list);	 
		}).then(function(object_name_countyid_value_list)  {  	  
		
						return resolve(object_name_countyid_value_list) 	
						
		}).catch(function(error) { console.log('33发生错误！', error);})   
		////////////////////////////////////////////////////////// 
		////////////////////////////////////////////////////////// 
    });
}		
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Convert_object_array_to_output(now_variable, object_variables){
    return new Promise(function(resolve, reject){ 
		//8  [list_town_name, list_1hr_time, list_temp2m, list_windwd_deg, list_windwd_grd, list_windws_grd, list_apcp24, list_hmid2m];
		//8  [             0,             1,           2,               3,               4,               5,            6,           7];
		/////////////////////////////////// 
		///////////////////////////////////   
		var var_names = ['ta2m', 'apcp24', 'rh2m', 'wddeg10m','wdgrd10m', 'wsgrd10m' ];  			///var_names.shift(); 
		////////////
		idx00_inuse=999 ;
		idx_inuse=999 ;
		if(now_variable=='ta2m'){ idx_inuse=2;idx00_inuse=0;
		}else if(now_variable=='wddeg10m'){ idx_inuse=3;idx00_inuse=3;
		}else if(now_variable=='wdgrd10m'){ idx_inuse=4;idx00_inuse=4;  /////汉字
		}else if(now_variable=='wsgrd10m'){ idx_inuse=5;idx00_inuse=5;
		}else if(now_variable=='apcp24'){ idx_inuse=6;idx00_inuse=1;
		}else if(now_variable=='rh2m'){ idx_inuse=7;idx00_inuse=2;
		}  else{  	if(now_variable!='/favicon.ico'){ console.log("      idx_inuse error!"); }
					else{ console.log("      now_variable!='/favicon.ico'"); } return false; 
		} 
		
		var list_1variable = object_variables[idx_inuse];  
		//////////////////////////////////////////////////////////////////////////////////
		///console.log(" a---------"+list_1variable.length );
		///console.log(" b---------"+list_1variable  ); 
		
		object_name_county_value_list=[] ; 
		for(var iiii=0; iiii<list_1variable.length; iiii++)			 
		{
			var json_element={};
		    ///console.log("---------"+object_variables[0][iiii]  );
			json_element.name = var_names[idx00_inuse]
			///json_element.county = object_variables[0].toString().split('-')[1];
			if(idx_inuse==4){
				json_element.value = list_1variable[iiii]; 
			} else{
				json_element.value = parseFloat(list_1variable[iiii]);
			}
			json_element.townfullname = object_variables[0][iiii] ;
			
			object_name_county_value_list.push(json_element) 
		}
		
		////////////////////////////////////////////////////////////////////////////////// 
		return resolve(object_name_county_value_list) 	  
		///////////////////////////////////
		///////////////////////////////////  
    });
}	
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////    很少的操作，就会导致str变成var类型，失去string类型属性
function Read_live_1time_newest_alltown(result_str) {
    return new Promise(function(resolve, reject){
		 
		var all_line = result_str.toString().split('\n');
		
		var list_town_name=[]; 
		var list_1hr_time=[], list_temp2m=[], list_windwd_deg=[], list_windwd_grd=[], list_windws_grd=[], list_apcp24=[], list_hmid2m=[] ;
	
		var cnt_line=0, cnt_town=0;
		var flag=Boolean(0) 
		for(var iiiii = 0, len111 = all_line.length; iiiii < len111; iiiii++)  {  
			if(all_line[iiiii] !="\n")  {
				var tempStr=all_line[iiiii].toString().trim() ;
				while(tempStr.indexOf("'        ,'") !=-1) {
					tempStr = tempStr.replace('        ,','        null,')	 ;}	
				while(tempStr.indexOf(",,") !=-1)   {
					tempStr = tempStr.replace(',,',',null,') ;}	 
				while(tempStr.indexOf(",\n") !=-1)   {
					tempStr = tempStr.replace(',\n',',null\n') ; 	}
					
				tempStr=tempStr.replace('\n','');
				 
				while(tempStr.indexOf(",") !=-1)   {
					tempStr = tempStr.replace(',',' ')	 ;}
				while(tempStr.indexOf("  ") !=-1)   { 
					tempStr = tempStr.replace('  ',' ')	 	 ;} 
				while(tempStr.indexOf(" ") !=-1)   { 
					tempStr = tempStr.replace(' ',',')  ;} 
				if(tempStr[0]               ==','){tempStr=tempStr.substr(1);}
				if(tempStr[tempStr.length-1]==','){tempStr=tempStr.substr(0,tempStr.length-2);}
				 
				var tempStr_list=tempStr.split(',') ;
				
				///now_stations = now_params.stations;	///临时性读取分片数据时，无用
				///										///读取整块数据txt时，吉林省，内蒙古自治区，指示返回多个站点
														
				if(all_line[iiiii].toString().substr(0,2)=="00"){ 
					var tempStr_list_ele=tempStr_list[6].toString(); 
					if(tempStr_list_ele.split('-')[0]=="吉林" || tempStr_list_ele.split('-')[0]=="内蒙古"){   //文件内省份判断
						list_town_name.push(tempStr_list_ele );
						cnt_town=cnt_town+1;
						flag=Boolean(1);
						cnt_line=0;
					} 
					else{
						flag=Boolean(0) 
					}
				}
				if( flag==Boolean(1) ){
					if( cnt_line==1 ){  
						index_choosen=tempStr_list.length-1; ///最近一个时次的序号
						list_1hr_time.push(tempStr_list[index_choosen]+"h") ;
					}
					else if( cnt_line==2 ){ 											///list_temp2m
						list_temp2m.push(tempStr_list[index_choosen]) ;
					}
					else if( cnt_line==3 ){ 											///list_windwd_deg
						list_windwd_deg.push(tempStr_list[index_choosen]);
					}
					else if( cnt_line==4 ){ 											///list_windwd_grd
						list_windwd_grd.push(tempStr_list[index_choosen]); 
					}
					else if( cnt_line==5 ){ 											///list_windws_grd
						list_windws_grd.push(tempStr_list[index_choosen]) ;
					}
					else if( cnt_line==6 ){ 											///list_apcp24
						var temp_accmu_rain24hr_value=0.0; 
						for(var iii = 0, len2222 = tempStr_list.length; iii < len2222; iii++)  {  
							if( tempStr_list[iii]!="null") {	///24小时累计降水量 
								temp_accmu_rain24hr_value += parseFloat( tempStr_list[iii]	)	; 					
							}
						}
						list_apcp24.push(   temp_accmu_rain24hr_value  .toString() )	;	
					}
					else if( cnt_line==7 ){ 		 									////list_hmid2m
						list_hmid2m.push(tempStr_list[index_choosen] ) ;
					} 
					cnt_line=cnt_line+1 ;
				}
			} 
		} 
		//////////////////////////////////////////////////////////////////////////////////8
		object_variables = [list_town_name, list_1hr_time, list_temp2m, list_windwd_deg, list_windwd_grd, list_windws_grd, list_apcp24, list_hmid2m];
		 
		return resolve(object_variables) ;	 
    });
}   
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Readin_str_from_file_txt(filepath, decode_type){				////universial Func
    return new Promise(function(resolve, reject){
		   
		console.log(filepath+" exist222")
		////////////////////////////////////
		var buffer = new Buffer('Hello World!');
		var text_temp = "";
		var result_str = ""
		
		var func0 = function(){
			buffer = Buffer.from(rf.readFileSync(filepath,{encoding:'binary'}),'binary'); 
		} 
		var func1  = function(){
			text_temp = iconv.decode(buffer, decode_type);	//使用GBK解码 
		}
		var func2  = function(){ 
			result_str = iconv.encode(text_temp, 'utf8');  
		}    
		var func3 = function(){
			return resolve(result_str) 					//////////////!!!!!!!!!!!!!!!!!!! 
		} 
		  
		Promise.resolve().then(func0).then(func1).then(func2).then(func3).catch(function(error) { console.log('222发生错误！', error);})   	;
		
    });
}
/////////////////////////////////////////////////////  
/////////////////////////////////////////////////////  
	existFile = Promise.promisify(rf.existsSync);   //Reads the contents of a directory
/////////////////////////////////////////////////////    
/////////////////////////////////////////////////////  
function Get_json_output_from_bip(filepath_bip, now_lon, now_lat, now_variables){
    return new Promise(function(resolve, reject){ 
		var0000 = filepath_bip.split('data1_', 2)[1].split('_f000', 2)[0] 
		filepath_bip2 = filepath_bip.replace(var0000, now_variables);
		filepath_hdr = filepath_bip.replace(".bip", ".hdr");
		filepath_hdr2 = filepath_hdr.replace(var0000, now_variables);
		filepath_hdr2 = "/data1/liuzhonghua/data/gfs_fcst_merged_bip/201708/2017082418/apcp.hdr"
		flag_hdr_exist = existFile(filepath_hdr2);		
		
		if (flag_hdr_exist) { 
			console.log(filepath_hdr2+" exist")
			Readin_str_from_file_txt(filepath_hdr2, 'utf8')
				.then(function(str_data_now_hdr)  {  
					return Readin_data_from_bip(filepath_bip2, str_data_now_hdr, now_lon, now_lat) 			///////需要返回的函数前要加return！！！！！！！！！！！！！！
				}).then(function(str_list_float__str_data_now_hdr)  {    
					return Convert_list_float_to_json_output(str_list_float__str_data_now_hdr, filepath_bip2, now_lon, now_lat)
				}).then(function(json_output)  {    
					return resolve(json_output) 
				}).catch(function(error) { console.log('hdr read 发生错误！', error);})   
		}
		else{
			console.log(filepath_hdr+" file not exist!!")
			return resolve("hdr file not exist!!") 
		}
    });
}	

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function Convert_list_float_to_json_output(str_list_float__str_data_now_hdr, filepath_bip2, now_lon, now_lat){
    return new Promise(function(resolve, reject){ 
		str_list_float   = str_list_float__str_data_now_hdr[0];	 
		var jsObj = JSON.parse(str_list_float__str_data_now_hdr[1] ) .band
	  
		////data1_ta2m_f000_f120_modela2017080918utc___merged2017081002bjt.hdr 中band中，存储UTC时间的预报时次
		var var_name = filepath_bip2.split('data1_')[1].split('_f000_f120_modela')[0]		
		var str_yyyymmddhh_utc = filepath_bip2.split('_modela')[1].split('utc___merged')[0]		
		var yyyy=str_yyyymmddhh_utc.substr(0,4)	
		var mm=str_yyyymmddhh_utc.substr(4,2)	
		var dd=str_yyyymmddhh_utc.substr(6,2)	
		var hh=str_yyyymmddhh_utc.substr(8,2)
		var str_yyyy_mm_dd_hh_utc 			= yyyy+"-"+mm+"-"+dd+" "+hh+":00:00";			////BJT	
		var timestamp_utc = Date.parse(new Date(str_yyyy_mm_dd_hh_utc))/ 1000;   ////timestamp_utc1502272800
		/////////////////////////////////////// js里对象是无序的，不同浏览器遍历结果不一样。
		//var stringTime_loc_delta 	= "1970-01-01 08:00:00";
		//var timestamp_loc_delta = Date.parse(new Date(stringTime_loc_delta))/ 1000;     ////==0 			
		////"1970-01-01 16:00:00";			timestamp=28800
		delta_1hr_timestamp=3600
		//var stringTime_bjt 			= "2017-08-09 18:00:00";			////BJT		 
		//var timestamp_bjt = Date.parse(new Date(stringTime_bjt))/ 1000;   ////timestamp_utc1502272800
		
		var json_output = {status: "0" };  				///"data":    
		json_output.data={}
		json_output.data.source_file = String(filepath_bip2)
		json_output.data.fcst_time = "utc_"+str_yyyy_mm_dd_hh_utc; 
		json_output.data.value1_min = String(Math.max.apply( Math, str_list_float ) ) 
		json_output.data.value1_max = String(Math.min.apply( Math, str_list_float ) ) 
		
		/////////////////////////////////// 
		object_fcst_value_list=[] ; 
		for(var iiii_hr=0; iiii_hr<max_fcst_hr; iiii_hr++)			 
		{
			var str_timestamp_bjt = String(Number(timestamp_utc) + delta_1hr_timestamp*iiii_hr) 
			var json_element={}; 
			
			if (jsObj.hasOwnProperty(str_timestamp_bjt)){ 
				json_element.name = var_name; 
				json_element.req_lat=now_lat
				json_element.req_lon=now_lon
				json_element.fcst_hr = parseFloat(jsObj[str_timestamp_bjt]); 
				json_element.value = parseFloat(str_list_float[iiii_hr]); 
				object_fcst_value_list.push(json_element) 
			} 
		}
		///////////////////////////////////  
		json_output.data.data = object_fcst_value_list; 
		return resolve(json_output) 
    });
}		 
/////////////////////////////////////////////////////    
/////////////////////////////////////////////////////  
function Readin_data_from_bip(filepath_bip, str_data_now_hdr, now_lon, now_lat){
    return new Promise(function(resolve, reject){ 		 
		var jsObj=JSON.parse(str_data_now_hdr)
					 
		xSize = parseFloat(JSON.stringify( jsObj.xSize ))
		ySize = parseFloat(JSON.stringify( jsObj.ySize ))
		itemSize = parseFloat(JSON.stringify( jsObj.itemSize ))
		totalBand = parseFloat(JSON.stringify( jsObj.totalBand ))
		geoTransform = jsObj.geoTransform  		///geo_transform=(lon1_chn, dxy, 0.0, lat1_chn, 0.0, -1*dxy) 
		lon1_chn= parseFloat(geoTransform[0])
		dx		= parseFloat(geoTransform[1])
		lat1_chn= parseFloat(geoTransform[3])
		dy		= parseFloat(geoTransform[5]) * -1
		
		x_inuse = parseInt( (now_lon  - lon1_chn)/dx + 0 )
		y_inuse = parseInt( (lat1_chn - now_lat )/dy + 0 )
		///##print(lat_temp[1]," ",lon_temp[1])				###lat1=53.75   lon1=73.25
		 
		console.log("filepath_bip="+filepath_bip.substr(30))
		console.log("totalBand="+totalBand)
		////console.log("geoTransform="+geoTransform)
		////console.log("Size:"+xSize+" "+ySize)
		////console.log("NE:"+lon1_chn+" "+lat1_chn+"       NOW:"+now_lon+" "+now_lat)
		////console.log("inuse:"+x_inuse +" "+y_inuse)
		////对于体积较大的二进制文件，比如音频、视频文件，动辄几个GB大小，如果使用这种方法，很容易使内存“爆仓”。理想的方法应该是读一部分，写一部分，不管文件有多大，只要时间允许，总会处理完成，这里就需要用到流的概念。
		////////////////////////////////////
		////Buffer对象占用的内存空间是不计算在Node.js进程内存空间限制上的，
		////因此，我们也常常会使用Buffer来存储需要占用大量内存的数据
		////////////////////////////////////
		////比如当前时间戳为1447656645380，如果将其当作一个字符串存储时，需要占用11字节的空间，
		////而将其转换为二进制存储时仅需6字节空间即可：
		////////////////////////////////////
		//var buf = new Buffer(4);
		//buf.writeFloatLE(10.555, 0, 4); 
		//console.log(buf.readFloatLE(0, 3)) 	 
	
		var buffer_numpy_buf = new Buffer(157*253*4 *totalBand); 
		var float_value=999; 
		var list_float=[]; 
		////////////////////////////////////	
		////////////////////////////////////	
		console.log(filepath_bip)
		filepath_bip="/data1/liuzhonghua/data/gfs_fcst_merged_bip/201708/2017082418/apcp.bip"
		console.log(filepath_bip)
		var func0 = function(){
			buffer_numpy_buf = Buffer.from(rf.readFileSync(filepath_bip, {encoding:'binary'}) ,'binary') ;   
		}  
		var func1  = function(){ 
			for(var iiii = 0, len = totalBand; iiii < len; iiii++){  
				float_value = buffer_numpy_buf.readFloatLE(x_inuse*4 + 253*y_inuse*4 + 157*253*4*iiii, true);   
				list_float.push(float_value);	////首个数据为第一个文件的西北角点，温度为f000，降水为f001
			}  
		}     
		var func3 = function(){   
			////console.log(JSON.stringify(list_float) )
			return resolve([list_float,str_data_now_hdr])	
		}  
		Promise.resolve().then(func0).then(func1).then(func3).catch(function(error) { console.log('7777发生错误！', error);}) 
    });
}	    
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
function onRequest(request, response) { 
		var cIP = getClientIp(request) 
		////////////////////////////////////
		////////////////////////////////////
		/// 发送 HTTP 头部  
		/// HTTP 状态值: 200 : OK	///response.statusCode = 200; 
		/// 内容类型: text/plain	///response.setHeader('Content-Type', 'text/plain;charset=utf-8');
		response.writeHead(200, {  'Content-Type': 'application/json;charset=utf-8;'  });  
		////////////////////////////////////
		////////////////////////////////////
		console.log("------------------ from: "+cIP);
		cnt=cnt+1 
		////
		////
		////实况数据服务APIservice，示例：http://139.219.239.1:8123/live2?stations=吉林省&variable=apcp24
		////数量类型/xxx?：实况类，第二数据源，live2
		////数量站点s范围stations=xxx：“+”连接，现在只有吉林省
		////单变量var=xxx：ta2m,apcp24,rh2m,	
		
		////数量站点s范围stations=xxx：“+”连接，省名
		////				（强制加上自治区-广西自治区，加省-吉林省，加市-北京市，利于区分和省名同名市县名）
		////数量站点s范围stations=xxx：“+”连接，市县名（不加旗，不加区，不加镇，除非单字县，一般不加县）
		////单变量var=xxx：wd10m,ws10m
		////
		////
		////
		////请求request到达时，响应response的writeHead方法在请求头里写入status 200以及content-type头信息， 
		////write 方法将文本信息“Hello World”发送给响应body；最后end方法结束响应。
		////////////////////////////////////解释url参数 request.url  	使用 url.parse将数据由字符串转变为obj
		////////////////////////////////////parseQueryString            为true时将使用查询模块分析查询字符串，默认为false
		////////////////////////////////////slashesDenoteHost           默认为 false ，//foo/bar 形式的字符串将被解释成 { pathname: ‘//foo/bar' }
		////////////////////////////////////如果设置成true，//foo/bar 形式的字符串将被解释成  { host: ‘foo', pathname: ‘/bar' }
		////////////////////////////////////
		////////////////////////////////////
		////////////////////////////////////
		now_params = url.parse(request.url, true).query;  	 
		str_now_params = JSON.stringify(  now_params);  
		///console.log( str_now_params)	 
		
		var url_ele_list =str_now_params.replace("/","/").split(["/","?","=","&"]); 
		console.log(cnt+" "+ request.url.toString()+"  "+url_ele_list)
		//转换为json对象//parse将字符串转成对象,request.url="/?url=123&name=321"，true表示params是{url:"123",name:"321"}，false表示params是url=123&name=32 
		
		///索取数据种类
 		if (url.parse(request.url, true).pathname != "/"){
			now_category = url.parse(request.url, true).pathname; 	
			if ("variables" in JSON.parse(url_ele_list)){
				now_variables = now_params.variables;	///读取整块数据txt时，吉林省，内蒙古自治区，指示返回多个站点
			}else{
				response.end("http parameter 'variables' needs!!"  ); 
			}	
			/////////////////////////////////// 
			/////////////////////////////////// 
			if (now_category=="/"){   ///!isInteger(cnt/2) chrom 请求两次数据，postman和其他浏览器请求一次数据
				response.end("http parameter '/xxx' needs!!"  ); 
			}
			else if (now_category=="/diseases"){   ///!isInteger(cnt/2) chrom 请求两次数据，postman和其他浏览器请求一次数据
				Readin_str_from_file_txt(filename_diseases ,'utf8')									/// 	 
					.then(function(str_now_folder_diseases_yyyymmddhh)  {
								///console.log(+str_now_folder_diseases_yyyymmddhh );
								response.end(str_now_folder_diseases_yyyymmddhh); 
					}).catch(function(error) { console.log('diseases 发生错误！', error);})   
			}
			else if(now_category.substr(0,5)=="/fcst"){ 
				var dir_inuse="";
				if(now_category=='/fcst2'){  
					if ("lat" in JSON.parse(url_ele_list)){
						now_lat = now_params.lat;	///读取整块数据txt时，吉林省，内蒙古自治区，指示返回多个站点
					}else{
						response.end("http parameter 'lat' needs!!"  ); 
					}		
					if ("lon" in JSON.parse(url_ele_list)){
						now_lon = now_params.lon;	///读取整块数据txt时，吉林省，内蒙古自治区，指示返回多个站点
					}else{
						response.end("http parameter 'lon' needs!!"  ); 
					}		  
					
					dir_inuse=dir_fcst_merged_bip;
					
					Fetch_the_newest_folder(dir_inuse)										 
					.then(	function(newest_folder) {    
								return Fetch_the_newest_folder(newest_folder)   									/// 	
					}).then(function(newest_folder22)  {   
								return Fetch_the_newest_file_ta2m(newest_folder22, 'bip') 
					}).then(function(newest_file_bip)  {    
								return Get_json_output_from_bip(newest_file_bip, now_lon, now_lat, now_variables)	
					}).then(function(json_output)  {     
								response.end(JSON.stringify(json_output, null, 4)  );   							 	 
					}).catch(function(error) { console.log('fcst2 发生错误！', error);})  
				}
			}
			else if(now_category.substr(0,5)=="/live"){ 
				if ("stations" in JSON.parse(url_ele_list)){
					now_stations = now_params.stations;				///临时性读取分片数据时，无用
				}else{
					response.end("http parameter spatial range 'stations' needs!!"  ); 
				}
				
				var dir_inuse="";
				if(now_category=='/live222'){ 	dir_inuse=dir_list[0];
												console.log(JSON.stringify(now_params) +" "+now_category );
				}else if(now_category=='/live11'){ dir_inuse=dir_list[1];
												console.log(JSON.stringify(now_params) +" "+now_category  );
				}else if(now_category=='/live22'){ dir_inuse=dir_list[2];
												console.log(JSON.stringify(now_params) +" "+now_category );
				}else if(now_category=='/live333'){ dir_inuse=dir_list[3];
												console.log(JSON.stringify(now_params) +" "+now_category );
				}else if(now_category=='/favicon.ico'){ return false;
				}else  { response.end("http parameter '/xxx : pathname' wrong!!"  ); return false;
				}	 
				///////////////////////////////////
				/////////////////////////////////// 
				if(now_category=='/live333'){  
					var output_file_path="";
					Fetch_the_newest_folder(dir_inuse)										 
					.then(	function(newest_folder) {   
								console.log(newest_folder);
								return Fetch_the_newest_file(newest_folder, 'json')   									/// 	 
					}).then(function(newest_file)  {   
								console.log(newest_file.substr(20));
								output_file_path=newest_file;
								return Readin_str_from_file_txt(newest_file ,'GBK')
					}).then(function(result_str)  {  	  
								return Read_live_1time_newest_alltown(result_str) 
					}).then(function(object_variables)  {  	  
								return Convert_object_array_to_output( now_variables, object_variables)	///   
					///}).then(function(object_name_county_value_list)  {   				
					///			return	Add_county_id_to_object(object_name_county_value_list, meta_jilin61) ///object_name_countyid_value_list 
					}).then(function(object_name_county_value_list)  {   				
								return	Get_json_output_from_json_obj(object_name_county_value_list, output_file_path)  	/// 	
					}).then(function(json_output)  {  				
								/// 发送响应数据   
								///response.write( );    
								response.end(JSON.stringify(json_output, null, 4)  ); 
					}).catch(function(error) { console.log('live 发生错误！', error);})   
				}
				else {
					var output_file_path="";
					Fetch_the_newest_folder(dir_inuse)										 
					.then(	function(newest_folder) {   
								console.log(newest_folder);
								return Fetch_the_newest_file(newest_folder, 'json')   									/// 	 
					}).then(function(newest_file)  {   
								console.log(newest_file.substr(20));
								output_file_path=newest_file;
								return Readin_str_from_file_txt(newest_file ,'GBK')
					}).then(function(result_str)  {  	  
								return Read_live_1time_newest_alltown(result_str) 
					}).then(function(object_variables)  {  	  
								return Convert_object_array_to_output( now_variables, object_variables)	///   
					}).then(function(object_name_county_value_list)  {   				
								return	Add_county_id_to_object(object_name_county_value_list, meta_jilin61) ///now_stations 
					}).then(function(object_name_countyid_value_list)  {   				
								return	Get_json_output_from_json_obj(object_name_countyid_value_list, output_file_path)  	/// 	
					}).then(function(json_output)  {  				
								/// 发送响应数据   
								///response.write( );    
								response.end(JSON.stringify(json_output, null, 4)  ); 
					}).catch(function(error) { console.log('live 发生错误！', error);})   
				}
				///////////////////////////////////
				///////////////////////////////////
			}  
		}
		else{
			response.end("http parameter datatype: 'pathname' needs!!"  ); 
		}
		
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
const p1 = new Promise((resolve, reject) => {
	 resolve('hello11');
}).then(result => result) 

const p2 = new Promise((resolve, reject) => {
	 resolve('hello22'); 	  ///throw new Error('报错了');
}).then(result => result) 
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
if ('__main__'== '__main__') 	
{ 
	const response_info = "通过HTTPGet方式成功加入队列";
	/////////////////////////////////////////////////////////////////////////////////////// 8124 
	const port = 8123;  
	const host_bajie = '139.219.239.1';
	const host = '';  
	console.log( 'Nodejs Server running at host_bajie  http//' +host_bajie +'::'+ port);  
	///////////////////////////////////////////////////////////////////////////////////////   
	max_fcst_hr=200
	///////////////////////////////////////////////////////////////////////////////////////  
	filename_diseases='/data1/liuzhonghua/data/now_folder_diseases_yyyymmddhh.txt'     
	///////////////////////////////////////////////////////////////////////////////////////   
	dir222='/data1/liuzhonghua/data/crawler/live/live1hr_cnweather_jlagri69/archive/'   
	dir333='/data1/liuzhonghua/data/crawler/live/live1hr_cnweather_neimeng/archive/'  
	dir11='/data1/liuzhonghua/data/crawler/live/nmc/'   
	dir22='/data1/liuzhonghua/data/crawler/live/cnweather/'    
	var dir_list = [dir222, dir11, dir22, dir333];  	/////OS自动检索大量小文件！！！！性能！！！！
	///////////////////////////////////////////////////////////////////////////////////////   
	dir_fcst_merged_bip="/data1/liuzhonghua/data/gfs_fcst_merged_bip/";
	///////////////////////////////////////////////////////////////////////////////////////  
	meta_jilin61='/home/liuzhonghua/model/crawler_ww/metadata/gid61_geojson_jilin_v1.txt'  
	console.log('meta_jilin61='+meta_jilin61); 
	console.log('///////////////////////////////////////////////////Start 1');  
	///////////////////////////////////////////////////////////////////////////////////////  
	///当一个请求到来时，传递给 createServer 的匿名函数将会执行，其携带的两个参数代表请求和响应。
	var cnt=0
	http.createServer(onRequest).listen(port, host);
	
	Promise.all([p1, p2]) .then(result => console.log("33"+result)) .catch(e => console.log(e));
};
////////////////////////////////////////////////////////////////////////
//////var server = http.createServer(onRequest);		///server.listen(port, host);   	///省略listen()第二个参数,监听所有本机IP,
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
//ps -ax | grep node //找出所有node应用
//sudo kill :pid //找到你要杀死node进程的pid 
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////coding的时候不用考虑并发问题。
////////////////////////////////////////////////////////////////////////处理I/O的操作结果基本上都需要在回调函数中处理
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////回调一点也不符合函数式编程的精神。
////////////////////////////////////////////////////////////////////////回调函数什么都不返回，没有返回值的函数，执行它仅仅是因为它的副作用。
////////////////////////////////////////////////////////////////////////所以用回调函数编程天生就是指令式的，是以副作用为主的过程的执行顺序，
////////////////////////////////////////////////////////////////////////	而不是像函数那样把输入映射到输出，可以组装到一起。
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
    ///console.info(new Date().getTime());
    ///console.info(eval(a.join("+")));
    ///console.info(new Date().getTime());
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
		///\’ 单引号 \” 双引号 \ 反斜杠 \n 换行 \r 回车 \t tab(制表符) \b 退格符 \f 换页符 
////////////////////////////////////////////////////////////////////////