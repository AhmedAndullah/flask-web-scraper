var MainisJS = function( $ps_selector, $po_startelement ) {
	this.co_element = new Array();
	this.ca_dataset = {};
	this.cb_debug_console = false;
	
	if( "string" === typeof($ps_selector) )
	 {
		this.init_parse( $ps_selector, $po_startelement );
	 }
	else if( "object" === typeof($ps_selector) )
	 {
		this.co_element = new Array($ps_selector);
	 }
	 
	this.length = this.co_element.length;
};

var mJS = function( $ps_selector, $po_startelement )
 {
	var $obj = new MainisJS( $ps_selector, $po_startelement );
	 
	return $obj;
 }


MainisJS.prototype.init_parse = function( $ps_selector, $po_startelement )
 {
	var $tmp_rootelements = new Array();
	var $tmp_foundelements = new Array();
	var $tmp_selektor_type = 0;
	var $tmp_selektor_name = "";
	var $tmp_x = new Array();
	var $tmp_item = null;
	if( "undefined" === typeof($po_startelement) )
	 {
		$tmp_rootelements.push(document);
	 }
	else
	 {
		$tmp_rootelements.push($po_startelement);
	 }

	var $tmp_elements = $ps_selector.split(" ");
	for( $i=0; $i<$tmp_elements.length; $i++ )
	 {
		if( "" === $tmp_elements[$i] )
		 {
			continue;
		 }

		if( -1 < $tmp_elements[$i].indexOf("#") )
		 {
			$tmp_selektor_type = 1;
			$tmp_selektor_name = $tmp_elements[$i].substr( $tmp_elements[$i].indexOf("#")+1 );
		 }
		// class-Selektor
		else if( -1 < $tmp_elements[$i].indexOf(".") )
		 {
			$tmp_selektor_type = 2;
			$tmp_selektor_name = $tmp_elements[$i].substr( $tmp_elements[$i].indexOf(".")+1 );
		 }
		else
		 {
			$tmp_selektor_type = 3;
			$tmp_selektor_name = $tmp_elements[$i];
		 }

		// Alle unsere Grundelemente mÃ¼ssen wir durchgehen und anhand des
		// Selektors die neuen Elemente suchen. Diese werden temporÃ¤r
		// gespeichert als Ergebnismenge. Sind alle Grundelemente durchlaufen
		// worden, so wird die aktuelle Treffermenge der Endtreffermenge
		// zugeordnet. Werden weitere Selektoren angegeben, wird auf Basis
		// der neuen Grundmenge in dieser weitergesucht.
		// 
		// Bsp.:
		//  Selektor: p div a
		//  Grundmenge: document
		//  Treffermenge: document.getElementsByName( "p" );
		//  Treffermenge: { foreach(Grundmenge).getElementsByName( "div" ); }
		//  Endtreffermenge: { foreach(Grundmenge).getElementsByName( "a" ); }
		// 
		// Die Endtreffermenge beinhaltet alle a-Tags die innerhalb eines
		// div-Elements liegen, das wiederum in einem p-Element liegt.
		$tmp_foundelements = new Array();
		for( $j=0; $j<$tmp_rootelements.length; $j++ )
		 {
			$tmp_x = null;
			$tmp_item = null;
			if( 1 === $tmp_selektor_type )
			 {
				$tmp_x = document.getElementById($tmp_selektor_name);
				if( $tmp_x && -1 === $tmp_foundelements.indexOf($tmp_x) )
				 {
					$tmp_foundelements.push( $tmp_x );
				 }
			 }
			else if( 2 === $tmp_selektor_type )
			 {
				$tmp_x = $tmp_rootelements[$j].getElementsByTagName("*");
				for( $x_i=0; $x_i<$tmp_x.length; $x_i++ )
				 {
					$tmp_item = $tmp_x.item($x_i);
					if( this.hasClass($tmp_selektor_name, $tmp_item) && -1 === $tmp_foundelements.indexOf($tmp_item) )
					 {
						$tmp_foundelements.push( $tmp_item );
					 }
				 }
			 }
			else if( 3 === $tmp_selektor_type )
			 {
				$tmp_x = $tmp_rootelements[$j].getElementsByTagName($tmp_selektor_name);
				for( $x_i=0; $x_i<$tmp_x.length; $x_i++ )
				 {
					$tmp_item = $tmp_x.item($x_i);
					if( $tmp_item && -1 === $tmp_foundelements.indexOf($tmp_item) )
					 {
						$tmp_foundelements.push( $tmp_item );
					 }
				 }
			 }
		 }
		
		$tmp_rootelements = $tmp_foundelements;
	 }
	// Alle gefundenen Elemente speichern
	this.co_element = $tmp_rootelements;
 }






/*
 * Expand the MainisJS class for an data()-method.
 * 
 * @param 	string 	$ps_data_attribut 	Attribut das ausgelesen werden soll
 * @param 	mixed 	$pm_data_value 		Neuer Wert der gesetzt werden soll
 * @return 	mixed						Entweder nichts (setter/Atribut nicht vorhanden) oder der gespeicherte Wert
 */
MainisJS.prototype.data = function( $ps_data_attribut, $pm_data_value )
 {
	if( null === this.co_element || 1 > this.co_element.length || null === this.co_element[0] )
	 {
		return false;
	 }
	 
	 
	var $tmp_attribute = this.get_valid_html5data_attribut( $ps_data_attribut );
	this.debug( $tmp_attribute, "Bereinigtes data-Attribut" );
	// Getter:
	if( typeof($pm_data_value) === "undefined" )
	 {
		var $tmp_attr = this.co_element[0].attributes;
		for( var $i = 0; $i < $tmp_attr.length; $i++ )
		 {
			var $attr = $tmp_attr.item($i);
			if( $attr.nodeName.match( "data-" + $tmp_attribute ) || $attr.nodeName.match( "data-" + $tmp_attribute ) )
			 {
				this.debug( $attr.nodeValue, "data-Getter" );
				return $attr.nodeValue;
			 }
		 }
	 }
	// Setter:
	else
	 {
		this.debug( "data-" + $tmp_attribute + "=" + $pm_data_value, "data-Setter" );
		for( $i=0; $i<this.co_element.length; $i++ )
		 {
			this.co_element[$i].setAttribute( "data-" + $tmp_attribute, $pm_data_value );
		 }
	 }
 }
 
MainisJS.prototype.get_valid_html5data_attribut = function( $ps_attribut )
 {
	var $tmp_str = "";
	var $tmp_char = "";
	for( $i=0; $i<$ps_attribut.length; $i++ )
	 {
		$tmp_char = $ps_attribut.substr($i,1);
		if( "A" <= $tmp_char && "Z" >= $tmp_char )
		 {
			$tmp_str = $tmp_str + "-" + ($tmp_char.toLowerCase());
		 }
		else
		 {
			$tmp_str = $tmp_str + $tmp_char;
		 }
	 }
	 
	return $tmp_str;
 }










MainisJS.prototype.hasClass = function( $ps_classname, $po_element )
 {
	var $b_result = false;
	var $classes  = "";
	$ps_classname = " " + $ps_classname + " ";
	if( "undefined" !== typeof($po_element) )
	 {
		$classes = " " + $po_element.className + " ";
		$b_result = (-1 < $classes.indexOf($ps_classname));
	 }
	else
	 {
		for( $i=0; $i<this.co_element.length; $i++ )
		 {
			$classes = " " + this.co_element[$i].className + " ";
			$b_result = ( (-1 < $classes.indexOf($ps_classname)) && ($b_result || 0===$i) );
		 }
	 }
	return $b_result;
 }

MainisJS.prototype.addClass = function( $ps_classname, $po_element )
 {
	if( "undefined" === typeof($po_element) )
	 {
		for( $i=0; $i<this.co_element.length; $i++ )
		 {
			if( !this.hasClass($ps_classname, this.co_element[$i]) )
			 {
				this.co_element[$i].className = this.trim( this.co_element[$i].className + " " + $ps_classname);
			 }
		 }
	 }
	else
	 {
		$po_element.className = this.trim( $po_element.className + " " + $ps_classname);
	 }
	
 }

MainisJS.prototype.removeClass = function( $ps_classname, $po_element )
 {
	var $classes  = "";
	$ps_classname = " " + $ps_classname + " ";
	
	if( "undefined" === typeof($po_element) )
	 {
		for( $i=0; $i<this.co_element.length; $i++ )
		 {
			$classes = " " + this.co_element[$i].className + " ";
			this.co_element[$i].className = this.trim( $classes.replace($ps_classname, "") );
		 }
	 }
	else
	 {
		$classes = " " + $po_element.className + " ";
		$po_element.className = this.trim( $classes.replace($ps_classname, "") );
	 }
	
 }
 
MainisJS.prototype.toggleClass = function( $ps_classname )
 {
	for( $i=0; $i<this.co_element.length; $i++ )
	 {
		if( !this.hasClass($ps_classname, this.co_element[$i]) )
		 {
			this.addClass($ps_classname, this.co_element[$i]);
		 }
		else
		 {
			this.removeClass($ps_classname, this.co_element[$i]);
		 }
	 }
 }


 
 
MainisJS.prototype.show = function( $pi_duration )
 {
	var $element_height = 0, $steps = 0;
	for( $i=0; $i<this.co_element.length; $i++ )
	 {
		this.co_element[$i].style.display = "block";
		$element_height = this.co_element[$i].clientHeight;

		this.co_element[$i].style.display = "none";
		/* Animation */

		/* Animation End */
		this.co_element[$i].style.display = "block";
	 }
 }

MainisJS.prototype.hide = function( $pi_duration )
 {
	for( $i=0; $i<this.co_element.length; $i++ )
	 {
		$element_height = this.co_element[$i].clientHeight;
		this.co_element[$i].style.display = "none";
	 }
 }

MainisJS.prototype.toggle = function( $pi_duration )
 {
	for( $i=0; $i<this.co_element.length; $i++ )
	 {
		if( "none" === this.co_element[$i].style.display )
		 {
			this.co_element[$i].style.display = "block";
		 }
		else
		 {
			this.co_element[$i].style.display = "none";
		 }
	 }
 }




MainisJS.prototype.trim = function( $ps_str )
 {
	return $ps_str.replace(/^\s+|\s+$/gm, "");
 }















MainisJS.prototype.debug = function( $pm_debug, $ps_prefix )
 {
	if( true === this.cb_debug_console )
	 {
		if( typeof($pm_debug) === "string" )
		 {
			this.debug_log( "["+$ps_prefix + "] " + $pm_debug );
		 }
		else
		 {
			this.debug_log( "[Object] " + $pm_debug ); 
		 }
	 }
	
	if( typeof(console) !== "undefined" )
	 {
		//console.debug( $pm_debug );
	 }
 }

MainisJS.prototype.debug_log = function( $pm_str )
 {
	var $log = document.getElementById("log")
	if( typeof($pm_str) !== "undefined" && $log )
	 {
		$log.innerHTML = $log.innerHTML + "<br />" + $pm_str;
	 }
 }

 
MainisJS.prototype.assert = function( $pm_description, $pm_expect, $pm_value )
 {
	this.debug_log( "ASSERT " + $pm_description + ": "+( $pm_expect==$pm_value ? "<span style=\"color:#0A0;\">success</span>":"<span style=\"color:#F00;\">failed</span>" ) );
	if( typeof(console) !== "undefined" )
	 {
		console.debug( "ASSERT", $pm_description, " ( erwartet: ", $pm_expect, " | tatsaechlich: ", $pm_value, ") => ", ($pm_expect==$pm_value) );
	 }
 }




