/**
 * override nest metadata, only apply this decorator in method
 * NOTE : this override method can only override 1-level metadata so if you have multiple
 * inheritance, this decorators only override the last inheritance
 */
export const Override = () => {
  return (target: any, __: any, property: PropertyDescriptor) => {
    let currentTarget = target;
    let parentPropertyDescriptor;
    do {
      /**
       * if the desired target doesn't have any parent
       */
      if (Object.getPrototypeOf(currentTarget.constructor).name === '') {
        throw new Error(
          `class ${currentTarget.constructor.name} doesn't have parent`,
        );
      }
      currentTarget = Object.getPrototypeOf(currentTarget);
      /**
       * get the desired property descriptor
       */
      parentPropertyDescriptor = Object.getOwnPropertyDescriptor(
        currentTarget,
        property.value.name,
      );
    } while (!parentPropertyDescriptor);

    /**
     * get all metadata keys from parent property
     */
    const metadataKeys = Reflect.getOwnMetadataKeys(
      parentPropertyDescriptor.value,
    );

    /**
     * copying all metadata from parent property to target property
     */
    metadataKeys.forEach((mkey) => {
      const parentMetaData = Reflect.getMetadata(
        mkey,
        parentPropertyDescriptor.value,
      );
      Reflect.defineMetadata(mkey, parentMetaData, property.value);
    });
  };
};
