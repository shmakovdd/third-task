let form = document.querySelector('#form');
let loadFileBtn = document.querySelector('.buttons__loadFile');
let filesList = document.querySelector('.files');
let clearBtn = document.querySelector('.buttons__clear')
let body = document.body
let formResult = document.querySelector('.form-result')
const data = {}

let files = ['addpost', 'colorsheme', 'interview', 'signin', 'signup']
let selectedFile = 0

async function recieveFile() {
    let response = await fetch(`./json/${files[selectedFile]}.json`);
    if (!response.ok) {
        alert("Ошибка HTTP: " + response.status)
        return
    }
    let jsonFile = await response.json();
    form.innerHTML = ''
    let titleName = jsonFile.name;
    createElement({tag: 'h2', html: titleName, className: 'form__title', parent: form} )
    function renderFields() {
        let fields = jsonFile.fields;
        for (let field of fields) {
            let row = createElement({className: 'form__row', parent: form})
            let label = createElement({tag: 'label', html: field.label, className: 'form__label', parent: row})
            let tag = setTag(field)
            let attributes = field.input;
            createElement({tag: tag, parent: label, attr: attributes})
        }
        if (selectedFile == 1) {
            let checkbox = document.querySelector('[type="checkbox"]');
            checkTheme(checkbox)
            checkbox.addEventListener('change', changeTheme)
        }
    }

    function checkTheme(checkbox) {
        if (checkbox.checked) {
            body.classList.add('body--darktheme')
        } else {
            body.classList.remove('body--darktheme')
        }
    }
    function changeTheme(e) {
        body.classList.toggle('body--darktheme')
    }
    function renderRefs() {
        let refs = jsonFile.references;
        if (refs == undefined) return
        let haveInput = false;
        for (let ref of refs) {
            if (ref.input) {
                haveInput = true;
                let row = createElement({className: 'form__row form__checkbox', parent: form})
                let tag = setTag(ref)
                let attributes = ref.input;
                createElement({tag: tag, parent: row, attr: attributes})
            } else {
                let row = haveInput ? document.querySelector('.form__checkbox') 
                                                : createElement({className: 'form__row', parent: form})
                let text = []
                for (let item in ref) {
                    let element = item == 'ref' ? createElement({tag: 'a', parent: row, html: ref[item], attr: {'href': '#'}})
                                                : createElement({tag: 'span', parent: row, html: ref[item]})
                }
            }
        }
    }

    function renderBttns() {
        let bttns = jsonFile.buttons
        if(bttns == undefined) return
        let row = createElement({className: 'form__row form__row--buttons', parent: form})
        bttns.forEach((item, index) => {
            let type = index == 0 ? 'submit' : 'reset';
            let tag = index == 0 ? 'a' : 'button'
            createElement({tag: tag, parent: row, html: item.text, attr: {'type': type, 'href': './second.html'}})
        })
        let submitBtn = document.querySelector("[type='submit']")
        submitBtn.addEventListener('click', (e)=> {
            createForm()
        })
    }

   renderFields()
   renderRefs()
   renderBttns()

   let imageFiles = document.querySelectorAll("[type='file']");
   if(imageFiles) {
    for (let i = 0; i < imageFiles.length; i++) {
        imageFiles[i].addEventListener('change', (e)=> {
            updateImage(imageFiles[i], i)
        })
    }
   } 
}


function createForm() {
    for (let i = 0; i < form.elements.length; i++) {
        data[i] = form.elements[i].type == 'file' ? '' : form.elements[i].value
    }
    localStorage.setItem('data', JSON.stringify(data))
}

function setTag(field) {
    if (isInput(field.input.type) && field.input) {
        tag = 'input'
    } else if (field.input.type == 'textarea') {
        tag = 'textarea'
    } else {
        tag = 'select'
    }
    
    return tag
}

function isInput(type) {
    let attrs = ['text', 'file', 'date', 'checkbox', 'number', 'email', 'password']
    let match = attrs.indexOf(type)
    if (match == -1) {
        return false
    } else return true
}


function isValidAttribute(attr) {
    let attrs = ['required', 'placeholder', 'multiple', 'href', 'type', 'name']

    if (attrs.indexOf(attr) !== -1) {
        return true
    } else return false
}

function createMask(element, mask) {
    let input = element;
    input.setAttribute('type', 'text')
    let im = new Inputmask(mask)
    im.mask(input)
}

function updateImage(file, id) {
    if(!['image/jpeg', 'image/png', 'image/pdf'].includes(file.files[0].type)) {
        file.value = '';
        alert('Разрешены только форматы pfd, jpg, png')
    }

    let reader = new FileReader();
    reader.readAsDataURL(file.files[0]);
    reader.onload = function () {
        data[`image${id}`] = reader.result
    };

    console.log(data);
}

function createElement(options) {
    let tag = options.tag || "div";
    let html = options.html || "";
    let className = options.className || "";
    let parent = options.parent || document.body;
    let attributes = options.attr || null

    let element = document.createElement(tag)
    element.className = className
    element.innerHTML = `${html}`

    if (tag == 'select') {
        element.setAttribute('name', 'value[]')
        for (let attr in attributes) {
            if (Array.isArray(attributes[attr])) {
                attributes[attr].forEach(item => {
                    createElement({tag: 'option', html: item, parent: element})
                })
            }
        }
    }

    parent.append(element)

    if (attributes) {
        if (isInput(attributes.type)) {
            element.setAttribute('type', attributes.type)
        }
        for (let attr in attributes) {
            if(isValidAttribute(attr)) {
                element.setAttribute(attr, attributes[attr])
            }
            if(attr == 'filetype') {
                let filetypes = attributes[attr].join('/')
                element.setAttribute('accept', `${filetypes}`)
            }

            if (attr == 'mask') {
                createMask(element, attributes[attr])
            }

            if( attr == 'colors') {
                element.classList.add('color')
            } 

            if ( attr == 'checked' && attributes[attr] == 'true') {
                element.checked = true
            }
        }
    }
    return element
}


document.body.addEventListener('click', e => {
    if (e.target.classList.contains('color')) {
        let select = e.target;

        let title = document.querySelector('.form__title');
        select.addEventListener('change', e => {
            document.body.style.color = `${select.value}`
            title.style.color = `${select.value}`
        })
    }
})

if (form) {
    filesList.addEventListener('click', (e)=> {
        let target = e.target;
        selectedFile = target.dataset.id
    })
    
    clearBtn.addEventListener('click', ()=> {
        form.innerHTML = '';
    })
    
    loadFileBtn.addEventListener('click', recieveFile)
}

if(formResult) {
    let data = localStorage.getItem('data')
    data = JSON.parse(data)
    let list = createElement({tag: 'ul', className: 'form-result__list', parent: formResult})
    for (let key in data) {
        if (data[key] !== '' && isImage(key) == -1) {
            createElement({tag: 'li', className: 'form-result__item', parent: list, html: data[key]})
        } else if (isImage(key) !== -1) {
            let item = createElement({tag: 'li', className: 'form-result__item', parent: list})
            let img = createElement({tag: 'img', className: 'form-result__image', parent: item})
            img.setAttribute('src', `${data[key]}`)
        }

    }

    function isImage(item) {
        let key = 'image'
        return item.indexOf(key)
    }
}