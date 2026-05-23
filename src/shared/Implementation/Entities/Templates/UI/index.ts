import { CreateCurrencyPop, ICurrencyPopup } from "./CurrencyPopup";
import { CreateShopLockedItem, IShopLockedItem } from "./ShopLockedItem";
import { CreateShopUnlockedItem, IShopUnlockedItem } from "./ShopUnlockedItem";

class ClassUITemplates {
    public CurrencyPopup(): ICurrencyPopup {
        return CreateCurrencyPop();
    }
    public ShopLockedItem(): IShopLockedItem {
        return CreateShopLockedItem();
    }
    public ShopUnlockedItem(): IShopUnlockedItem {
        return CreateShopUnlockedItem();
    }
}

export const UITemplates = new ClassUITemplates();
