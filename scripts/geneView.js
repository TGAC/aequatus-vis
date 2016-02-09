/**
 * Created with IntelliJ IDEA.
 * User: thankia
 * Date: 14/08/2013
 * Time: 11:17
 * To change this template use File | Settings | File Templates.
 */

var data = "";

var colours = ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)', 'rgb(255,255,153)', 'rgb(177,89,40)', 'rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)', 'rgb(204,235,197)', 'rgb(255,237,111)']


var gene_list_array = [];
var ref_member = null
var syntenic_data = null;
var genome_db_id = null;
var chr = null;
var member_id = null;
var members = null;
var protein_member_id = null;
var ref_data = null;
var filter_div = null;

function init(json, control_div, filter_spacer) {

    member_id = json.ref;
    syntenic_data = json
    if (control_div) {
        setControls(control_div)
    }

    if(filter_spacer){
        console.log("spacer")
        console.log(filter_spacer)
        filter_div =  filter_spacer
        console.log(filter_div)
    }

    if (!syntenic_data.cigar) {
        syntenic_data.cigar = {};
        recursive_tree(syntenic_data.tree)

    }

    if (jQuery.type(syntenic_data.tree) == 'object') {
        // alert("It is JSON")
    }
    else {
        syntenic_data.tree = toNewick(syntenic_data.tree)
    }


    if (!syntenic_data.cigar) {
        syntenic_data.cigar = {};
        recursive_tree(syntenic_data.tree)

    }


    ref_data = syntenic_data.member[member_id]

    protein_member_id = json.protein_id
    resize_ref();

}

function recursive_tree(tree) {

    var child_lenth = tree.children.length;

    while (child_lenth--) {
        if (tree.children[child_lenth].sequence) {
            addCigar(tree.children[child_lenth])
        } else {
            recursive_tree(tree.children[child_lenth])
        }
    }

}

function addCigar(child) {
    var id = child.sequence.id[0].accession
    var cigar = child.sequence.mol_seq.cigar_line
    syntenic_data.cigar[id] = cigar;

}

function formatCigar(ref_exons, hit_cigar, colours, ref_cigar, reverse, ref_strand) {

    var no_of_exons = ref_exons.length
    var hit_cigar_arr = [];
    var ref_exon_array = [];
    var last_pos = 0;
    var i = 0
    var j = 0;
    while (i < no_of_exons) {
        console.log(ref_exons[i].length + " " + (ref_exons[i].end - ref_exons[i].start) + 1)
        var ref_exon = ref_exons[i].length// ? ref_exons[i].length : (ref_exons[i].end - ref_exons[i].start) + 1;
        if (parseInt(ref_exon) >= 0) {
            ref_exon_array.push(ref_exon)
        }
        i++;
    }

    console.log(ref_exon_array)

    var a = 0;
    var p = 0;

    var cigar_string = "";
    ref_cigar = ref_cigar.replace(/([SIXMND])/g, ":$1,");
    var cigars_array = ref_cigar.split(',');

    for (var i = 0; i < cigars_array.length - 1; i++) {

        var cigar = cigars_array[i].split(":");
        var key = cigar[1];
        var length = cigar[0] * 3;
        if (!length) {
            length = 3
        }
        while (length--) {
            cigar_string += key;
        }

        cigar_string += "";
    }

    var i = 0
    var total_len = 0;
    var flag = false;
    var cigar_string_match = cigar_string.replace(/D/g, '');
    while (i < ref_exon_array.length) {
        if (flag == false) {
            if (parseInt(total_len) + parseInt(ref_exon_array[i]) < cigar_string_match.length) {
                total_len += ref_exon_array[i];
            }
            else {
                ref_exon_array[i] = cigar_string_match.length - total_len;
                total_len = cigar_string_match.length;
                flag = true;
            }
        } else {
            ref_exon_array[i] = 0;
        }
        i++;
    }


    if (reverse) {
        ref_exon_array = ref_exon_array.reverse();
        var sum = 0;

        for (i = 0; i < ref_exon_array.length; i++) {
            sum += Number(ref_exon_array[i]);
        }
        var ref_cigar = cigar_string.replace(/D/g, "").length
        if (sum > ref_cigar) {
            ref_exon_array[0] = ref_exon_array[0] - (sum - ref_cigar)
        }
    }
    if (reverse && ref_strand == 1) {
        cigar_string = cigar_string.split("").reverse().join("");
        hit_cigar = hit_cigar.split("").reverse().join("");
    }


    while (j < cigar_string.length) {
        if (cigar_string.charAt(j) == 'D') {
            if (hit_cigar.charAt(j) == 'M') {
                hit_cigar = replaceAt(hit_cigar, j, "_");
            }
            else if (hit_cigar.charAt(j) == 'D') {
                hit_cigar = replaceAt(hit_cigar, j, "I");
            }
        }
        j++;
    }

    var j = 0;

    var b = 0;

    var temp_array = [];
    while (j < cigar_string.length) {
        if (cigar_string.charAt(j) == 'M') {
            if (a == ref_exon_array[p]) {
                p++;
                hit_cigar_arr.push(hit_cigar.substr(last_pos, b));
                temp_array.push(b + " : " + p)
                a = 0;
                last_pos += b;
                b = 0;
            }
            a++;
        }
        b++;
        j++;
    }

    hit_cigar_arr.push(hit_cigar.substr(last_pos, b));
    return hit_cigar_arr.join("-");

}


function reverse_compliment(sequence) {
    var complimentry = ""

    for (var i = 0; i < sequence.length; i++) {
        if (sequence.charAt(i).toUpperCase() == "A") {
            complimentry = "T" + complimentry
        } else if (sequence.charAt(i).toUpperCase() == "G") {
            complimentry = "C" + complimentry
        } else if (sequence.charAt(i).toUpperCase() == "C") {
            complimentry = "G" + complimentry
        } else if (sequence.charAt(i).toUpperCase() == "T") {
            complimentry = "A" + complimentry
        }
    }
    return complimentry;
}


function redrawCIGAR() {

    console.log("redraw cigar ")
    var count = 1;
    count++;
    console.log(count)
    var json = syntenic_data;
    if (json.ref) {
        gene_list_array = []
        var core_data = json.member;
        var max = 0;
        var keys = [];
        var ptn_keys = [];

        for (var k in core_data) keys.push(k);

        for (var k in json.cigar) ptn_keys.push(k);

        var ref_data = syntenic_data.member[syntenic_data.ref];


        for (var i = 0; i < keys.length; i++) {
            var temp_member_id = keys[i]


            var gene = syntenic_data.member[temp_member_id];
            if (max < gene.end - gene.start) {
                max = gene.end - gene.start;
            }


            var transcript_len = gene.Transcript.length;
            while (transcript_len--) {
                count++;
                console.log(count)

                if (gene.Transcript[transcript_len].Translation && ptn_keys.indexOf(gene.Transcript[transcript_len].Translation.id) >= 0) {
                    // count++; console.log(count)
                    var gene_start;
                    // count++; console.log(count)
                    var gene_stop;
                    count++;
                    console.log(count)
                    var gene_length = gene.Transcript[transcript_len].length;
                    // count++; console.log(count)
                    // console.log(gene.id)
                    // console.log(temp_member_id)

                    var svg = jQuery("#id" + temp_member_id).svg("get")

                    // count++; console.log(count)
                    var transcript_start = gene.Transcript[transcript_len].Translation.start;
                    var transcript_end = gene.Transcript[transcript_len].Translation.end;
                    // count++; console.log(count)

                    if (gene.Transcript[transcript_len].start < gene.Transcript[transcript_len].end) {
                        gene_start = gene.Transcript[transcript_len].start;
                        gene_stop = gene.Transcript[transcript_len].end;
                    }
                    else {
                        gene_start = gene.Transcript[transcript_len].end;
                        gene_stop = gene.Transcript[transcript_len].start;

                    }
                    // count++; console.log(count)
                    var maxLentemp = jQuery(document).width() * 0.6;
                    var newEnd_temp = max;
                    var stopposition = ((gene_stop - gene_start) + 1) * parseFloat(maxLentemp) / (newEnd_temp);
                    var temp_div = svg;

                    var strand = 0;
                    // count++; console.log(count)

                    if (syntenic_data.member[syntenic_data.ref].strand == gene.Transcript[transcript_len].strand) {
                        strand = 1;
                    } else {
                        strand = -1;
                    }

                    // count++; console.log(count)

                    if (temp_member_id != member_id) {

                        var g = svg.group({class: 'style1'});

                        dispCigarLine(g, syntenic_data.cigar[gene.Transcript[transcript_len].Translation.id], 1, top, ((gene_stop - gene_start) + 1), gene_start, stopposition, gene.Transcript[transcript_len].Exon.toJSON(), temp_div, ref_data.Transcript[0].Exon.toJSON(), transcript_start, transcript_end, strand, syntenic_data.cigar[protein_member_id], ref_data.strand, gene.Transcript[transcript_len].id, "style1");
                        //dispCigarLine(g, syntenic_data.cigar[protein_id], 1, top, ((gene_stop - gene_start) + 1), gene_start, stopposition, gene.Transcript[transcript_len].Exon.toJSON(), temp_div, ref_data.Transcript[0].Exon.toJSON(), transcript_start, transcript_end, strand, syntenic_data.cigar[protein_member_id], ref_data.strand, gene.Transcript[transcript_len].id, "style1");


                        var g = svg.group({class: 'style2'});

                        dispCigarLine(g, syntenic_data.cigar[gene.Transcript[transcript_len].Translation.id], 1, top, ((gene_stop - gene_start) + 1), gene_start, stopposition, gene.Transcript[transcript_len].Exon.toJSON(), temp_div, ref_data.Transcript[0].Exon.toJSON(), transcript_start, transcript_end, strand, syntenic_data.cigar[protein_member_id], ref_data.strand, gene.Transcript[transcript_len].id, "style2");

                    } else {


                        var g = svg.group({class: 'style1'});

                        dispCigarLineRef(g, syntenic_data.cigar[gene.Transcript[transcript_len].Translation.id], 1, top, ((gene_stop - gene_start) + 1), gene_start, stopposition, gene.Transcript[transcript_len].Exon.toJSON(), temp_div, gene.Transcript[transcript_len].Exon.toJSON(), transcript_start, transcript_end, gene.Transcript[transcript_len].Translation.id, "style1");


                        var g = svg.group({class: 'style2'});

                        dispCigarLineRef(g, syntenic_data.cigar[gene.Transcript[transcript_len].Translation.id], 1, top, ((gene_stop - gene_start) + 1), gene_start, stopposition, gene.Transcript[transcript_len].Exon.toJSON(), temp_div, gene.Transcript[transcript_len].Exon.toJSON(), transcript_start, transcript_end, gene.Transcript[transcript_len].Translation.id, "style2");

                    }
                    // count++; console.log(count)


                }


            }
        }
        count++;
        console.log(count)

        var view_type = null
        if (jQuery('input[name=view_type]:checked').val() == "with") {
            view_type = true;
        }
        else {
            view_type = false;
        }
        count++;
        console.log(count)

        if (view_type == true) {
            jQuery(".style1").show()
            jQuery(".style2").hide()
            //display = "display: block;"
        } else {
            jQuery(".style1").hide()
            jQuery(".style2").show()
            //display = "display: none;"
        }


    } else {
        jQuery("#gene_widget").html("")
        jQuery("#gene_widget").html("Selected Gene not found.")
        jQuery("#gene_tree_nj").html("<span style='font-size: large; text-align: center'>Selected Gene not found.</span>")
    }
}

function resize_ref() {
    var exon_nu = 0

    var i = null;
    jQuery.map(syntenic_data.member[syntenic_data.ref].Transcript, function (obj) {
        if (obj.Translation && obj.Translation.id == protein_member_id) {
            i = syntenic_data.member[syntenic_data.ref].Transcript.indexOf(obj)
        }
    });

    console.log(protein_member_id)
    console.log(syntenic_data.ref)
    console.log(i)

    syntenic_data.member[syntenic_data.ref].Transcript[i].Exon.sort(sort_by('start', true, parseInt));

    var diff = parseInt(syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu].end - syntenic_data.member[syntenic_data.ref].Transcript[0].Translation.start) + parseInt(1)

    while (diff < 0) {
        syntenic_data.member[syntenic_data.ref].Transcript[0].Exon[exon_nu].length = 0
        exon_nu++;
        diff = parseInt(syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu].end - syntenic_data.member[syntenic_data.ref].Transcript[0].Translation.start) + parseInt(1)
    }


    syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu].length = diff;
    syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu]._start += syntenic_data.member[syntenic_data.ref].Transcript[i].Translation.start - syntenic_data.member[syntenic_data.ref].Transcript[0].Exon[exon_nu].start;


    var exon_nu = syntenic_data.member[syntenic_data.ref].Transcript[0].Exon.length - 1
    var diff = parseInt(syntenic_data.member[syntenic_data.ref].Transcript[i].Translation.end - syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu]._start) + parseInt(1)
    while (diff < 0) {
        syntenic_data.member[syntenic_data.ref].Transcript[0].Exon[exon_nu].length = 0
        exon_nu--;
        diff = parseInt(syntenic_data.member[syntenic_data.ref].Transcript[i].Translation.end - syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu]._start) + parseInt(1)
    }
    syntenic_data.member[syntenic_data.ref].Transcript[0].Exon[exon_nu].length = diff;


}

function resize_ref_to_def() {

    var i = 10;
    jQuery.map(syntenic_data.member[syntenic_data.ref].Transcript, function (obj) {

        if (obj.Translation.id == protein_member_id) {
            i = syntenic_data.member[syntenic_data.ref].Transcript.indexOf(obj)
        }

    });


    var exon_nu = syntenic_data.member[syntenic_data.ref].Transcript[i].Exon.length;


    while (exon_nu--) {
        syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu].length = (syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu].end - syntenic_data.member[syntenic_data.ref].Transcript[i].Exon[exon_nu].start) + 1
    }


}

function checkCigar(ref_cigar_string) {

    var cigar_list = [];
    cigar_list.push(ref_cigar_string);

    var member = syntenic_data.cigar

    for (var id in syntenic_data.member) {

        if (member.hasOwnProperty(id)) {

            var cigar_string = "";
            var cigars = member[id].replace(/([SIXMND])/g, ":$1,");
            var cigars_array = cigars.split(',');

            for (var j = 0; j < cigars_array.length - 1; j++) {
                var cigar = cigars_array[j].split(":");
                var key = cigar[1];
                var length = cigar[0] * 3;
                if (!length) {
                    length = 3
                }
                while (length--) {
                    cigar_string += key;
                }

                cigar_string += "";
            }

            if (syntenic_data.member[id].strand != syntenic_data.ref.strand) {
                cigar_string.split("").reverse().join()
            }
            cigar_list.push(cigar_string);
        }
    }
    for (var i = 0; i < cigar_list[0].length; i++) {
        if (cigar_list[0][i] == 'D') {
            for (var j = 1; j < cigar_list.length; j++) {
                if (cigar_list[j][i] == 'M') {
                    break;
                }
                if (j == cigar_list.length - 1) {
                    cigar_list[0] = replaceAt(cigar_list[0], i, "I")
                }
            }
        }
    }

    return cigar_list[0];
}

function replaceAt(str, index, character) {
    return str.substr(0, index) + character + str.substr(index + character.length);
}


function changeReference(new_gene_id, new_protein_id) {
    console.log("change reference")
    console.log(new_gene_id)
    console.log(new_protein_id)


    jQuery("#id" + member_id + "geneline").attr("stroke", "green")
    jQuery("." + member_id + "genetext").attr("fill", "gray")

    resize_ref_to_def()

    jQuery("#circle" + member_id).attr("r", 4)
    jQuery("#circle" + new_gene_id).attr("r", 6)


    jQuery("#circle" + member_id).css("stroke-width", "1px")
    jQuery("#circle" + new_gene_id).css("stroke-width", "2px")

    jQuery("#circle" + member_id).css("stroke", "steelblue")
    jQuery("#circle" + new_gene_id).css("stroke", "black")

    jQuery("#id" + new_gene_id + "geneline").attr("stroke", "red")
    jQuery("." + new_gene_id + "genetext").attr("fill", "red")


    syntenic_data.ref = new_gene_id;
    protein_member_id = new_protein_id
    syntenic_data.protein_id = new_protein_id;


    jQuery(".match").remove()
    jQuery(".insert").remove()
    jQuery(".delete").remove()

    member_id = new_gene_id;

    resize_ref();
    redrawCIGAR()

}

var sort_by = function (field, reverse, primer) {

    var key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };

    reverse = [1, 1][+!!reverse];

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }

}

function setControls(control_div) {

    console.log("setControls " + control_div)
    var table = jQuery("<table cellpadding='2px'></table>");

    var row_spacing = jQuery("<tr></tr>");
    var column_spanning = jQuery("<th colspan=2></th>");
    column_spanning.html("Visual Controls")
    row_spacing.append(column_spanning)

    table.append(row_spacing)


    var row1 = jQuery("<tr></tr>");
    var column1 = jQuery("<td></td>");

    var input1 = jQuery('<input>', {
        type: "checkbox",
        id: "deleteCheck",
        onclick: 'toggleCigar(".delete")',
        "checked": "checked"
    });
    column1.html(input1)
    row1.append(column1)

    var column2 = jQuery("<td></td>");
    column2.html("Deletion")
    row1.append(column2)
    table.append(row1)

    var row2 = jQuery("<tr></tr>");
    var column1 = jQuery("<td></td>");

    var input = jQuery('<input>', {
        type: "checkbox",
        id: "matchCheck",
        onclick: 'toggleCigar(".match")',
        "checked": "checked"
    });
    column1.html(input)
    row2.append(column1)
    var column2 = jQuery("<td></td>");

    column2.html("Match")
    row2.append(column2)

    table.append(row2)

    var row3 = jQuery("<tr></tr>");
    var column1 = jQuery("<td></td>");
    var input = jQuery('<input>', {
        type: "checkbox",
        id: "insertCheck",
        onclick: 'toggleCigar(".insert")',
        "checked": "checked"
    });
    column1.html(input)
    row3.append(column1)

    var column2 = jQuery("<td></td>");

    column2.html("Insertion")
    row3.append(column2)

    table.append(row3)


    var row_spacing = jQuery("<tr></tr>");
    var column_spanning = jQuery("<th colspan=4></th>");
    column_spanning.html("Label")
    row_spacing.append(column_spanning)

    table.append(row_spacing)


    var row4 = jQuery("<tr></tr>");
    var column1 = jQuery("<td></td>");
    var input = jQuery('<input>', {
        type: "radio",
        name: "label_type",
        onclick: 'changeToGeneInfo()',
        "checked": "checked"
    });
    column1.html(input)
    row4.append(column1)

    var column2 = jQuery("<td></td>");

    column2.html("Gene Info")
    row4.append(column2)

    // table.append(row4)


    // var row5 = jQuery("<tr></tr>");
    var column3 = jQuery("<td></td>");
    var input = jQuery('<input>', {
        type: "radio",
        name: "label_type",
        onclick: 'changeToStable()()',
    });
    column3.html(input)
    row4.append(column3)

    var column4 = jQuery("<td></td>");

    column4.html("Stable ID")
    row4.append(column4)

    table.append(row4)

    var row_spacing = jQuery("<tr></tr>");
    var column_spanning = jQuery("<th colspan=4></th>");
    column_spanning.html("Introns")
    row_spacing.append(column_spanning)

    table.append(row_spacing)

    var row6 = jQuery("<tr></tr>");
    var column1 = jQuery("<td></td>");
    var input = jQuery('<input>', {
        type: "radio",
        name: "view_type",
        onclick: 'changeToNormal()'
    });
    column1.html(input)
    row6.append(column1)

    var column2 = jQuery("<td></td>");

    column2.html("With")
    row6.append(column2)

    var column3 = jQuery("<td></td>");
    var input = jQuery('<input>', {
        type: "radio",
        name: "view_type",
        onclick: 'changeToExon()',
        "checked": "checked"
    });
    column3.html(input)
    row6.append(column3)

    var column4 = jQuery("<td></td>");

    column4.html("Without")
    row6.append(column4)

    table.append(row6)

    jQuery(control_div).html(table)

}

function toggleCigar(kind) {
    console.log("toggleCigar " + kind)
    jQuery(kind).toggle()
}

