import * as ko from "knockout";
/*
	Note: - this file contains custom ko bindings.
		  - add new bindings as needed
*/


(ko.bindingHandlers as any).modal = {
    init: function (element, valueAccessor) {
        $(element).modal({
            show: false,
            backdrop: 'static'
        });

        var value = valueAccessor();
        if (ko.isObservable(value)) {
            $(element).on('hide.bs.modal', function (e) {
                value(false);
                e.stopPropagation();
            });
        }
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if (ko.utils.unwrapObservable(value)) {
            $(element).modal('show');
        } else {
            $(element).modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        }
    }
};

(ko.bindingHandlers as any).enterKey = {
    init: function (element, valueAccessor, allBindings, data, context) {
        var wrapper = function (data, event) {
            if (event.keyCode === 13) {
                valueAccessor().call(this, data, event);
            }
        };
        ko.applyBindingsToNode(element, { event: { keyup: wrapper } }, context);
    }
};

// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's slideDown()/slideUp() methods
// Could be stored in a separate utility library
(ko.bindingHandlers as any).fadeVisible = {
    init: function (element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function (element, valueAccessor) {
        var slideDuration = 550;
        // Whenever the value subsequently changes, slowly slide the element up or down
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).stop().slideDown(slideDuration) : $(element).stop().slideUp(slideDuration);
    }
};


//searchable dropdown that doesn't make calls on server to get value
(ko.bindingHandlers as any).datalist = (function () {
    var uid = 0;

    function createId() {
        return "ko-datalist-" + (++uid);
    }

    function getVal(rawItem, prop) {
        var item = ko.unwrap(rawItem);
        return item && prop ? ko.unwrap(item[prop]) : item;
    }

    function findItem(options, prop, ref) {
        return ko.utils.arrayFirst(options, function (item) {
            return ref === getVal(item, prop);
        });
    }
    return {
        after: ['value'],
        init: function (element, valueAccessor, allBindingsAccessor) {
            var setup = valueAccessor(),
                textProperty = ko.unwrap(setup.optionsText),
                valueProperty = ko.unwrap(setup.optionsValue),
                dataItems = ko.unwrap(setup.options),
                myValue = setup.value,
                datalist = document.createElement("DATALIST"),
                shouldSet = false;

            // create an associated <datalist> element
            var id = createId();
            element.setAttribute("list", id);
            datalist.id = id;
            if (element.parentNode) {
                element.parentNode.appendChild(datalist);
            } else {
                document.body.appendChild(datalist);
            }

            // when the value is changed, write to the associated myValue observable
            function updateModel() {
                if (!shouldSet) {
                    return;
                }
                var newVal = element.value,
                    dataItems = ko.unwrap(setup.options),
                    selectedItem = findItem(dataItems, textProperty, newVal),
                    newValue = selectedItem ? getVal(selectedItem, valueProperty) : newVal;

                if (ko.isWriteableObservable(myValue)) {
                    myValue(newValue);
                }
            }

            function updateView() {
                var modelValue = ko.unwrap(myValue),
                    dataItems = ko.unwrap(setup.options),
                    selectedItem = findItem(dataItems, valueProperty, modelValue),
                    newValue = selectedItem ? getVal(selectedItem, textProperty) : undefined;

                element.value = newValue || "";
            }

            // The first responds to changes in the value and to element changes
            ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
            ko.utils.registerEventHandler(element, "change", updateModel);

            // The second responds to changes in the model value (the one associated with the checked binding)
            ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });

            shouldSet = true;
        },
        update: function (element, valueAccessor) {
            var setup = valueAccessor(),
                datalist = element.list,
                dataItems = ko.unwrap(setup.options),
                textProperty = ko.unwrap(setup.optionsText),
                valueProperty = ko.unwrap(setup.optionsValue),
                descriptionProperty = ko.unwrap(setup.optionsDescription);

            // rebuild list of options when an underlying observable changes
            datalist.innerHTML = "";
            ko.utils.arrayForEach(dataItems, function (item) {
                var option = document.createElement("OPTION");
                (option as any).value = getVal(item, textProperty);
                if (descriptionProperty) {
                    option.innerText = getVal(item, descriptionProperty);
                }
                datalist.appendChild(option);
            });
            ko.utils.triggerEvent(element, "change");
        }
    };
})();