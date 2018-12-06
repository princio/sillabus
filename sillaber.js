
"use strict"

const NOT_AT_BEGIN_SILLABS = "bd|cn|cq|ld|lm|mb|mn|mp|nc|nd|ng|nq|ns|nt|nz|rc|rl|rs|rt|tm".split('|')


var $sillabus = $("#sillabus");
var $sillabus_div = $("#sillabus-div");
var cursil, curword, cur

function isV(i=0) {
    
    if(typeof i === 'number') {
        return 'aeiou'.indexOf(curword[i]) >= 0
    }
    if(typeof i === 'string' && i.length === 1) {
        return 'aeiou'.indexOf(i) >= 0
    }
    return false
}

function isC(i=0) {
    if(typeof i === 'number') {
        return 'bcdfghjklmnpqrstvwxyz'.indexOf(curword[i]) >= 0
    }
    if(typeof i === 'string' && i.length === 1) {
        return 'bcdfghjklmnpqrstvwxyz'.indexOf(i) >= 0
    }
    return false
}

function is(c, i) {
    if(c.length === 1)
        return c === curword[i]
    else
        return c.indexOf(curword[i]) >= 0
}

function isPunt(i) {
    if(typeof i === 'number') {
        return curword[i].search(/[^']\W/) !== -1
    }
    if(typeof i === 'string' && i.length === 1) {
        return i.search(/[^']\W/) !== -1
    }
    return false
}

function sillaba(word) {
    cur = 0
    cursil = []
    curword = word.toLowerCase()
    //– una vocale iniziale seguita da consonante semplice forma una sillaba
    // is('@|')
    let i=0, ctr = 0
    

    while(i < curword.length && ++ctr < 300) {

        //manual sillaba
        if(is('-', i)) {
            cursil.push(curword.substring(0, i))
            curword = curword.substring(i+1)
            i=0
        } else
        if(isPunt(i)) {
            cursil.push(curword.substring(0, i))
            cursil.push(curword.substring(i, i+1))
            curword = curword.substring(i+1)
            i=0
        } else
        // alo, ola, amo, polo, VOCALE+CONSONANTE+VOCALE sempre divisi anche ad inizio parola
        // alo, ola, amo, polo, CONSONANTE+VOCALE+CONSONANTE sempre divisi anche ad inizio parola
        if(
            isV(i) && isC(i+1) && isV(i+2)
            ||
            isV(i) && is('s', i+1) && !is('s', i+2)
            ) {
            cursil.push(curword.substring(0, i+1))
            curword = curword.substring(i+1)
            i=0
        } else
        // ECCETTO S+CONSONANTE ->
        // -> DOPPIE - TRE CONSONANTI CONSECUTIVE - SILLABE CON CUI NON SI INIZIA UNA FRASE
        if(
            (isC(i) && isC(i+1))
            &&
            !(   is('s', i) && !is('s', i+1)   )
            && (
                isC(i+2)
                || curword[i] === curword[i+1] 
                || NOT_AT_BEGIN_SILLABS.includes(curword.substring(i,i+2))
                )
            ) {
            cursil.push(curword.substring(0, i+1))
            curword = curword.substring(i+1)
            i=0
        } else
        // GRUPPI DIACRITICI - [cg]h[ie], [^s][cg]i[aouù], gli[aeu], sci[aou]
        if(
            (is('cg', i) && is('h', i+1) && is('ie', i+2))
            ||
            (!is('s', i) && is('cg', i) && is('i', i+1) && is('aouù', i+2))
        ) {
            if(i > 0) cursil.push(curword.substring(0, i))
            cursil.push(curword.substring(0, i+3))
            curword = curword.substring(i+3)
            i=0
        } else
        // GRUPPI DIACRITICI - gli[aeu], sci[aou]
        if(
            (is('g', i) && is('l', i+1) && is('i', i+2) && is('aeu', i+3))
            ||
            (is('s', i) && is('c', i+1) && is('i', i+2) && is('aou', i+3))
        ) {
            if(i > 0) cursil.push(curword.substring(0, i))
            cursil.push(curword.substring(i, i+4))
            curword = curword.substring(i+4)
            i=0
        } else
        if(
            (is('bcdfgptv', i) && is('lr', i+1) && isV(i+2))
        ) {
            if(i > 0) cursil.push(curword.substring(0, i))
            cursil.push(curword.substring(i, i+3))
            curword = curword.substring(i+3)
            i=0
        }
        else {
            ++i
        }
    }
    if(curword) 
    cursil.push(curword)

    return cursil
    

/*
    is('@|#')

    //– i gruppi solo grafici (formati con i segni ➔diacritici) costituiscono una sillaba con la vocale che segue
    is('bcdfgptv|lr|@') //[bcdfgptv][lr][aeiou]
    is('s|c|i|aou')     //sci[aou]
    is('g|l|i|aoue')    //gli[aoue]
    is('gc|i|aouù')     //[gc]i[aouù]
    is('cg|h|ei')       //[cg]h[ei]
    is('h|@')           //h[aeiuo]
*/
}

function html(A, sillabe, ctr) {
    let i = 0
    let a = []
    a.push({s: sillabe[0], i: i+ctr})
    if(sillabe.length > 1) {
        for(i = 1; i < sillabe.length-1; i++) {
            a.push({s: sillabe[i], i: i+ctr})
        }
        a.push({ s: sillabe[i], i: i+ctr})
    } else {
        a[0].c = ''
    }
    A.push(a)
}

$("#sillaba").click(function (e) {
    let text = $sillabus.val();
    let tmp = text.split('\n')
    let phrases = []
    let S = []

    tmp.forEach((phrase, i) => {
        phrases[i] = phrase.trim().replace(/\'(\w)/g, "' $1").split(/[\s]+/)//.split(' ').filter(w => w !== '')
    });
    
    let ctr = 0
    for(let i = 0; i < phrases.length; i++) {
        let phrase = phrases[i],
            ctr = 0
        S[i] = { phrase: [], num: 0 }
        for(let k = 0; k < phrase.length; k++) {
            let w = phrase[k],
                s = sillaba(w)
            ctr += s.length
            S[i].phrase.push({ 
                sillabe: s,
                text: s.join('-'),
                length: s.length,
                w: w })
        }
        S[i].num = ctr
    }

    let out = '', A = []
    for(let i = 0; i < S.length; i++) {
        let phrase = S[i].phrase

        A[i] = []
        
        html(A[i], phrase[0].sillabe, ctr)
        
        for(let k = 1; k < phrase.length; k++) {
            let w = phrase[k],
                w1 = phrase[k-1]
            
            html(A[i], w.sillabe)
            if(isV(w.text[0]) && (isV(w1.text[w1.text.length-1]) || w1.text[w1.text.length-1] === "'")) {
                A[i][k-1].sinalefeBegin = true
                A[i][k].sinalefeEnd = true
            }
        }
    }
    
    A.forEach((phrase) => {
        out += '<div class="phrase">'
        ctr = 0
        phrase.forEach(word => {
            out += `<span class="${word.sinalefeBegin ? 'SFB' : ''} ${word.sinalefeEnd ? 'SFE' : ''}">`
            word.forEach((sillaba, i) => {
                if(isPunt(sillaba.s)) {
                    out += `${sillaba.s}`
                } else
                if(!word.sinalefeBegin || (word.sinalefeBegin && word.length > 1 && i < word.length-1)) {
                    out += `<span>${sillaba.s}<span>${++ctr}</span></span>&nbsp;-&nbsp;`
                } else {
                    out += `<span>${sillaba.s}</span></span>&nbsp;-&nbsp;`
                }
            })
            out = out.substring(0, out.length-13) + '</span>'
            out +=word.sinalefeBegin ?  `‿` : '|'

        })
        out += '</div>'
    })

    $("#sillabus_").html(out)

/*
    let imax
    out=`<table><thead><tr><th>`+ '1,2,3,4,5,6,7,8,9,11,12,13,14,15'.split(',').join('</th><th>') + '</th></thead><tbody>'
    A.forEach((phrase) => {
        out += '<tr>'
        ctr = 0
        phrase.forEach(word => {
            word.forEach((sillaba, i) => {
                if(isPunt(sillaba.s)) {
                    out += `${sillaba.s}`
                } else
                if(!word.sinalefeBegin || (word.sinalefeBegin && word.length > 1 && i < word.length-1)) {
                    out += `<td>${sillaba.s}</td>`
                } else {
                    out += `<td>${sillaba.s}</td>`
                }
            })
        })
        out += '</tr>'
    })
    out+='</tbody></table>'

    $("#sillabus_").append(out)*/
})


$("#sillaba").trigger('click')