/**
 * Knüpft eine automatische Anzeige des Animationsfensters an das Ereignis zum
 * Verlassen der Webseite. Achtung: Das macht unter anderem Probleme bei Anfragen
 * die letztlich in Downloads enden!
 * 
 * Entscheidungsfrage: $GCB_LOADER_ANIMATION_ON_UNLOAD : boolean
 */

var $animation_object = null;

addIVENAListener("load", window, function() {
	$animation_object = document.getElementById("loading_animation");
});

if( "undefined" !== typeof($GCB_LOADER_ANIMATION_ON_UNLOAD) && true === $GCB_LOADER_ANIMATION_ON_UNLOAD )
 {
	addIVENAListener("beforeunload", window, function() {
		if( !$animation_object )
		 {
			return;
		 }
		$animation_object.style.display = 'block';
	});
 }


/**
 * Zeigt das Animationsfenster
 */
function show_loading_animation()
 {
	if( !$animation_object )
	 {
		return;
	 }
	$animation_object.style.display = 'block';
 }


/**
 * Versteckt das Animationsfenster
 */
function hide_loading_animation()
 {
	if( !$animation_object )
	 {
		return;
	 }
	$animation_object.style.display = 'none';
 }