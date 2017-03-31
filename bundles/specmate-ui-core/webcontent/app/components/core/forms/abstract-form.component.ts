import { Objects } from '../../../util/Objects';
import { Component, Input } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { MetaInfo, FieldMetaItem } from "../../../model/meta/field-meta";
import { SpecmateDataService } from "../../../services/specmate-data.service";

@Component({
    moduleId: module.id,
    selector: 'input-form',
    templateUrl: 'abstract-form.component.html'
})
export class AbstractForm {

    public errorMessage: string = 'This field is required.';

    private formGroup: FormGroup;

    private ready: boolean = false;

    private _element: any;

    private get element(): any {
        return this._element;
    }

    @Input()
    private set element(element: any) {
        if (!element) {
            return;
        }
        if (!this._element) {
            this._element = element;
            this.createForm();
        } else {
            this._element = element;
            this.updateForm();
        }
    }

    private meta: FieldMetaItem[];

    constructor(private formBuilder: FormBuilder, protected dataService: SpecmateDataService) {
        this.initEmpty();
    }

    ngDoCheck(args: any) {
        this.updateForm();
    }

    private orderFieldMeta(): void {
        this.meta.sort((item1: FieldMetaItem, item2: FieldMetaItem) => Number.parseInt(item1.position) - Number.parseInt(item2.position));
    }

    private initEmpty(): void {
        this.formGroup = this.formBuilder.group({});
    }

    private createForm(): void {
        if (!this._element) {
            return;
        }
        this.meta = MetaInfo[this.element.className];
        if (!this.meta) {
            this.initEmpty();
            return;
        }
        this.orderFieldMeta();
        var formBuilderObject: any = {};
        for (let i = 0; i < this.meta.length; i++) {
            let fieldMeta: FieldMetaItem = this.meta[i];
            let fieldName: string = fieldMeta.name;
            let formBuilderObjectValue: any[] = [''];
            if (this.meta[i].required) {
                formBuilderObjectValue.push(Validators.required);
            }
            formBuilderObject[fieldName] = formBuilderObjectValue;
        }
        this.formGroup = this.formBuilder.group(formBuilderObject);

        this.formGroup.valueChanges.subscribe(() => {
            this.updateFormModel();
            return '';
        });
        this.ready = true;
        this.updateForm();
    }

    private updateForm(): void {
        if (!this.ready) {
            return;
        }
        let formBuilderObject: any = {};
        for (let i = 0; i < this.meta.length; i++) {
            let fieldMeta: FieldMetaItem = this.meta[i];
            let fieldName: string = fieldMeta.name;
            let fieldType: string = fieldMeta.type;
            let value: any = this.element[fieldName] || '';
            if (fieldType === 'checkbox') {
                value = AbstractForm.convertToBoolean(value);
            }
            formBuilderObject[fieldName] = value;
        }
        this.formGroup.setValue(formBuilderObject);
    }

    private updateFormModel(): void {
        if (!this.formGroup.valid) {
            // TODO DISABLE SAVE BUTTON
            //return;
        }
        // We need this, since in some cases, the update event on th control is fired, even though the data did actually not change. We want to prevent unnecessary updates.
        let changed: boolean = false;
        for (let i = 0; i < this.meta.length; i++) {
            let fieldMeta: FieldMetaItem = this.meta[i];
            let fieldName: string = fieldMeta.name;
            let updateValue: string | boolean = this.formGroup.controls[fieldName].value;
            if (updateValue === undefined) {
                updateValue = '';
            }
            // We do not need to clone here (hopefully), because only simple values can be passed via forms.
            if (this.element[fieldName] !== updateValue) {
                this.element[fieldName] = updateValue;
                changed = true;
            }
        }
        if (changed) {
            this.dataService.updateElement(this.element, true);
        }
        else {
            console.log("SKIPPING UPDATE");
        }
    }

    public get isValid(): boolean {
        return this.formGroup.valid;
    }

    private static isBooleanText(str: string): boolean {
        return AbstractForm.convertToBoolean(str) !== undefined;
    }

    private static convertToBoolean(str: string): boolean {
        if (str.toLowerCase() === 'true') {
            return true;
        } else if (str === '' || str.toLocaleLowerCase() === 'false') {
            return false;
        }
        return undefined;
    }
}

export class FieldType {
    public static TEXT: string = 'text';
    public static TEXT_LONG: string = 'longText';
    public static CHECKBOX: string = 'checkbox';
    public static SINGLE_SELECT: string = 'singleSelect';
}