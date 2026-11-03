"use client";

import type { ProductDto } from "@/modules/products/application/product.dto";
import { useTranslations } from "@/shared/i18n/use-translations";
import { Button } from "@/shared/presentation/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/presentation/ui/dialog";
import { Spinner } from "@/shared/presentation/ui/spinner";

interface DeleteProductDialogProps {
  /** Producto a eliminar; null = diálogo cerrado. */
  product: ProductDto | null;
  isDeleting: boolean;
  onConfirm: (product: ProductDto) => void;
  onCancel: () => void;
}

/**
 * Confirmación de eliminación. Funciona igual en móvil y en escritorio.
 *
 * - role="alertdialog": anuncia que es una decisión importante.
 * - Mientras se elimina, no se puede cerrar (ni con Esc ni tocando fuera).
 * - El foco empieza en "Cancelar" (primer botón): la opción segura.
 */
export function DeleteProductDialog({ product, isDeleting, onConfirm, onCancel }: DeleteProductDialogProps) {
  const t = useTranslations();

  return (
    <Dialog
      open={product !== null}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <DialogContent role="alertdialog" closeLabel={null}>
        <DialogHeader>
          <DialogTitle>{t.products.deleteTitle}</DialogTitle>
          <DialogDescription>{product ? t.products.deleteDescription(product.name) : null}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              {t.common.cancel}
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={() => product && onConfirm(product)}
          >
            {isDeleting && <Spinner />}
            {isDeleting ? t.products.deleting : t.common.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
