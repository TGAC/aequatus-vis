/**
 *
 * @param string
 * @param width
 * @param newClass
 * @returns {*}
 */
function stringTrim(string, width, newClass) {
    if (newClass) {
        jQuery("#ruler").addClass(newClass.toString())
    }
    else {
        jQuery("#ruler").addClass("ruler")
    }
    var ruler = jQuery("#ruler");
    var inLength = 0;
    var tempStr = "";

    jQuery("#ruler").html(string);
    inLength = jQuery("#ruler").width();

    if (newClass) {
        jQuery("#ruler").removeClass(newClass.toString())
    }
    else {
        jQuery("#ruler").removeClass("ruler")
    }

    if (inLength < width) {
        return string;
    }
    else {
        width = parseInt(string.length * width / inLength);
        var string_title = string.replace(/\s+/g, '&nbsp;');
        return "<span title=" + string_title + ">" + string.substring(0, width) + "... </span>";
    }

}

/**
 *
 */
function checkVisuals() {

    if (jQuery("#deleteCheck").is(':checked'))
        jQuery(".delete").show();  // checked
    else
        jQuery(".delete").hide();  // unchecked

    if (jQuery("#matchCheck").is(':checked'))
        jQuery(".match").show();  // checked
    else
        jQuery(".match").hide();  // unchecked

    if (jQuery("#insertCheck").is(':checked'))
        jQuery(".insert").show();  // checked
    else
        jQuery(".insert").hide();  // unchecked

    if (jQuery("#utrCheck").is(':checked'))
        jQuery(".utr").show();  // checked
    else
        jQuery(".utr").hide();  // unchecked jQuery('.utr').toggle()

    if (jQuery('input[name=label_type]:radio:checked').val() == "stable") {
        jQuery(".genelabel").hide();
        jQuery(".stable").show();
    } else {
        jQuery(".genelabel").hide();
        jQuery(".geneinfo").show();
    }


}


/**
 * 
 */
function resize() {
    drawChromosome();
    drawMember();
    select_chr();
    if (member_id == undefined) {
        select_member();
        drawSelected();
    } else {

        var start = 0;
        for (var i = 0; i < members.length; i++) {
            if (members[i].id == member_id) {
                start = members[i].start;
            }
        }
        rearrange_selector(member_id, start, chr);
        drawSelected();
        drawSynteny(true);
    }
}